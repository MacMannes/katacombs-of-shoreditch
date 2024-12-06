import {
    ActionTrigger,
    CallerId,
    CommandAction,
    CommandHandler,
    Condition,
    Game,
    Item,
    Room,
    TextWithAudioFiles,
} from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class GameController {
    private isPlaying = true;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public async startGame() {
        await this.ui.displayWelcomeMessage();
        await this.displayCurrentRoom();

        while (this.isPlaying) {
            const userInput = (await this.ui.getUserInput()) ?? '';
            const [verb, target] = userInput.split(' ');
            await this.processCommand(verb, target);
        }
    }

    public async quitGame(): Promise<boolean> {
        await this.ui.displayMessage(new TextWithAudioFiles('Bye!', ['bye']));
        this.isPlaying = false;
        return true;
    }

    public getCurrentRoom(): Room {
        return this.game.getCurrentRoom();
    }

    public getInventory(): Item[] {
        return this.game.getItems();
    }

    public async processCommand(verb: string, target?: string) {
        const executedItemTriggers = this.executeItemTriggers(target, verb);
        if (executedItemTriggers) return;

        const handler = this.getCommandHandler(verb, target);
        if (!handler || handler.isInternal) {
            await this.ui.displayMessage(new TextWithAudioFiles('What?', ['msg-what']));
            return;
        }

        await handler.handle(target ?? '', 'commandProcessor');
    }

    private executeItemTriggers(target: string | undefined, verb: string): boolean {
        let executedTrigger = false;

        const targetItem = target ? this.findItem(target) : undefined;
        targetItem?.triggers
            ?.filter((trigger) => this.shouldExecuteTrigger(trigger, verb))
            ?.forEach((trigger) => {
                trigger.actions.forEach((action) => this.executeTriggerAction(action));
                executedTrigger = true;
            });

        return executedTrigger;
    }

    private shouldExecuteTrigger(trigger: ActionTrigger, verb: string): boolean {
        if (trigger.verb !== verb) return false;

        if (trigger.conditions) {
            return this.verifyConditions(trigger.conditions);
        }

        return true;
    }

    private verifyConditions(conditions: Condition[]): boolean {
        const checkConditions = conditions.map((condition) => this.verifyCondition(condition));
        return checkConditions.every((value) => value);
    }

    private verifyCondition(condition: Condition): boolean {
        if (condition.type === 'location' && condition.key === 'currentLocation') {
            return this.game.getCurrentRoom().name === condition.value;
        }
        if (condition.type === 'hasState') {
            return this.game.getCurrentRoom().findItem(condition.key)?.getCurrentState() === condition.value;
        }

        return false;
    }

    private async executeTriggerAction(action: CommandAction) {
        const handler = this.getCommandHandler(action.command, action.argument);
        if (!handler) {
            return false;
        }

        const result = await handler.handle(action.argument, action.parameter, 'triggerAction');
        await this.displayActionResultMessage(action, result);
    }

    private async displayActionResultMessage(action: CommandAction, result: boolean) {
        const message = result ? action.responses?.success : action.responses?.failure;
        if (!message) return;

        await this.ui.displayMessage(this.game.getTextWithAudioFiles(message));
    }

    private getCommandHandler(verb: string, target?: string): CommandHandler | undefined {
        const handler = this.commandHandlers[verb];
        if (!handler) return undefined;

        const requiresTarget = handler.requiresTarget ?? true;
        if (requiresTarget && !target) {
            return undefined;
        }

        return handler;
    }

    private commandHandlers: Record<string, CommandHandler> = {
        go: { handle: (target) => this.go(target) },
        look: { requiresTarget: false, handle: (target) => this.look(target) },
        take: { handle: (target) => this.take(target) },
        drop: { handle: (target, _value, caller) => this.drop(target, caller) },
        quit: { requiresTarget: false, handle: () => this.quitGame() },
        inventory: { requiresTarget: false, handle: () => this.displayInventory() },
        speak: { isInternal: true, handle: (value) => this.speak(value) },
        reveal: { isInternal: true, handle: (target) => this.reveal(target) },
        hide: { isInternal: true, handle: (target) => this.hide(target) },
        changeState: { isInternal: true, handle: (target, value) => this.changeState(target, value) },
    };

    private async go(to: string): Promise<boolean> {
        const newRoom = this.game.go(to);
        if (!newRoom) {
            await this.ui.displayMessage(this.game.getTextWithAudioFiles('msg-no-way'));
            return false;
        }
        await this.displayCurrentRoom();
        return true;
    }

    private async look(at?: string): Promise<boolean> {
        if (!at) {
            await this.displayCurrentRoom('long');
            return false;
        }

        const message = this.game.look(at);
        await this.ui.displayMessage(message);
        return true;
    }

    private async take(itemName: string): Promise<boolean> {
        const result = this.game.take(itemName);
        const textKey = result.success ? 'msg-ok' : result.error.message;
        await this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return result.success;
    }

    private async drop(itemName: string, caller?: CallerId): Promise<boolean> {
        const dropped = this.game.drop(itemName);
        if (caller === 'triggerAction') return dropped;

        const textKey = dropped ? 'msg-ok' : 'msg-not-carrying-it';
        await this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return dropped;
    }

    private async changeState(target: string, value?: string): Promise<boolean> {
        if (!value) return false;

        const item = this.findItem(target);
        if (!item || item.getCurrentState() === value) return false;

        item.setState(value);
        return true;
    }

    private async reveal(target: string): Promise<boolean> {
        const item = this.getCurrentRoom().findItem(target, true);
        if (!item || item.isVisible()) return false;

        item.reveal();
        return true;
    }

    private async hide(target: string): Promise<boolean> {
        const item = this.getCurrentRoom().findItem(target, true);
        if (!item || !item.isVisible()) return false;

        item.hide();
        return true;
    }

    public findItem(itemName: string): Item | undefined {
        return this.game.findItem(itemName);
    }

    public async displayInventory(): Promise<boolean> {
        const items = this.game.getItems();
        if (items.length == 0) {
            await this.ui.displayMessage(this.game.getTextWithAudioFiles('msg-not-carrying-anything'));
            return true;
        }

        const textKeys = items.map((item) => item.getDescription('inventory'));
        textKeys.unshift(['msg-carrying-the-following', 'msg-nothing']); // Add these to the beginning of the array
        const text = this.game.getConcatenatedTextForItemKeys(textKeys, '\n- ');
        await this.ui.displayMessage(new TextWithAudioFiles(text, textKeys.flat()));
        return true;
    }

    private async displayCurrentRoom(preferredLength?: 'short' | 'long') {
        await this.ui.displayRoomTitle(this.getCurrentRoom());
        await this.displayRoom(preferredLength);
    }

    private async displayRoom(preferredLength?: 'short' | 'long') {
        const roomDescription = this.game.describeRoom(preferredLength);
        await this.ui.displayMessage(roomDescription);
    }

    private async speak(value: string): Promise<boolean> {
        await this.ui.displayMessage(this.game.getTextWithAudioFiles(value));
        return true;
    }
}
