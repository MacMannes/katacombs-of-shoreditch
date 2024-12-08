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
import { ChangeStateCommand, DropCommand, GoCommand, LookCommand, TakeCommand } from '@katas/katacombs/commands';
import { isDefined } from '@utils/array';

export class GameController {
    private isPlaying = true;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public async startGame() {
        await this.ui.displayWelcomeMessage();
        this.displayCurrentRoom();

        while (this.isPlaying) {
            const userInput = (await this.ui.getUserInput()) ?? '';
            const [verb, target] = userInput.split(' ');
            this.processCommand(verb, target);
        }
    }

    public quitGame(): boolean {
        this.ui.displayMessage(new TextWithAudioFiles('Bye!', ['bye']));
        this.isPlaying = false;
        return true;
    }

    public getCurrentRoom(): Room {
        return this.game.getCurrentRoom();
    }

    public getInventory(): Item[] {
        return this.game.getItems();
    }

    public processCommand(verb: string, target?: string) {
        const executedItemTriggers = this.executeItemTriggers(target, verb);
        if (executedItemTriggers) return;

        const handler = this.getCommandHandler(verb, target);
        if (!handler || handler.isInternal) {
            this.ui.displayMessage(new TextWithAudioFiles('What?', ['msg-what']));
            return;
        }

        handler.handle(target ?? '', 'commandProcessor');
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

    private executeTriggerAction(action: CommandAction) {
        const handler = this.getCommandHandler(action.command, action.argument);
        if (!handler) {
            return false;
        }

        const result = handler.handle(action.argument, action.parameter, 'triggerAction');
        this.displayActionResultMessage(action, result);
    }

    private displayActionResultMessage(action: CommandAction, result: boolean) {
        const message = result ? action.responses?.success : action.responses?.failure;
        if (!message) return;

        this.ui.displayMessage(this.game.getTextWithAudioFiles(message));
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

    private go(to: string): boolean {
        return new GoCommand(this.game, this.ui).execute({ params: [to] });
    }

    private look(at?: string): boolean {
        const params = at ? { params: [at] } : undefined;
        return new LookCommand(this.game, this.ui).execute(params);
    }

    private take(itemName: string): boolean {
        return new TakeCommand(this.game, this.ui).execute({ params: [itemName] });
    }

    private drop(itemName: string, caller?: CallerId): boolean {
        return new DropCommand(this.game, this.ui).execute({ params: [itemName], caller });
    }

    private changeState(target: string, value?: string): boolean {
        return new ChangeStateCommand(this.game).execute({ params: [target, value]?.filter(isDefined) });
    }

    private reveal(target: string): boolean {
        const item = this.getCurrentRoom().findItem(target, true);
        if (!item || item.isVisible()) return false;

        item.reveal();
        return true;
    }

    private hide(target: string): boolean {
        const item = this.getCurrentRoom().findItem(target, true);
        if (!item || !item.isVisible()) return false;

        item.hide();
        return true;
    }

    public findItem(itemName: string): Item | undefined {
        return this.game.findItem(itemName);
    }

    public displayInventory(): boolean {
        const items = this.game.getItems();
        if (items.length == 0) {
            this.ui.displayMessage(this.game.getTextWithAudioFiles('msg-not-carrying-anything'));
            return true;
        }

        const textKeys = items.map((item) => item.getDescription('inventory'));
        textKeys.unshift(['msg-carrying-the-following', 'msg-nothing']); // Add these to the beginning of the array
        const text = this.game.getConcatenatedTextForItemKeys(textKeys, '\n- ');
        this.ui.displayMessage(new TextWithAudioFiles(text, textKeys.flat()));
        return true;
    }

    private displayCurrentRoom(preferredLength?: 'short' | 'long') {
        this.ui.displayRoomTitle(this.getCurrentRoom());
        this.displayRoom(preferredLength);
    }

    private displayRoom(preferredLength?: 'short' | 'long') {
        const roomDescription = this.game.describeRoom(preferredLength);
        this.ui.displayMessage(roomDescription);
    }

    private speak(value: string): boolean {
        this.ui.displayMessage(this.game.getTextWithAudioFiles(value));
        return true;
    }
}
