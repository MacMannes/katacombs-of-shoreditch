import { CommandAction, CommandHandler, Game, Item, Room } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class GameController {
    private isPlaying = true;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public async startGame() {
        this.ui.displayWelcomeMessage();
        this.displayCurrentRoom();

        while (this.isPlaying) {
            const userInput = (await this.ui.getUserInput()) ?? '';
            const [verb, target] = userInput.split(' ');
            this.processCommand(verb, target);
        }
    }

    public quitGame(): boolean {
        this.ui.displayMessage('Bye!');
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
            this.ui.displayMessage('What?');
            return;
        }

        handler.handle(target ?? '');
    }

    private executeItemTriggers(target: string | undefined, verb: string): boolean {
        let executedTrigger = false;

        const targetItem = target ? this.findItem(target) : undefined;
        targetItem?.triggers
            ?.filter((trigger) => trigger.verb === verb)
            ?.forEach((trigger) => {
                trigger.actions.forEach((action) => this.executeAction(action));
                executedTrigger = true;
            });

        return executedTrigger;
    }

    private executeAction(action: CommandAction) {
        const handler = this.getCommandHandler(action.command, action.argument);
        if (!handler) {
            return false;
        }

        const result = handler.handle(action.argument, action.parameter);
        this.displayActionResultMessage(action, result);
    }

    private displayActionResultMessage(action: CommandAction, result: boolean) {
        const message = result ? action.responses?.success : action.responses?.failure;
        if (!message) return;

        this.ui.displayMessage(message);
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
        drop: { handle: (target) => this.drop(target) },
        quit: { requiresTarget: false, handle: () => this.quitGame() },
        inventory: { requiresTarget: false, handle: () => this.displayInventory() },
        speak: { isInternal: true, handle: (value) => this.speak(value) },
        changeState: { isInternal: true, handle: (target, value) => this.changeState(target, value) },
    };

    private go(to: string): boolean {
        const newRoom = this.game.go(to);
        if (!newRoom) {
            this.ui.displayMessage('There is no way to go that direction.');
        }
        this.displayCurrentRoom();
        return true;
    }

    private look(at?: string): boolean {
        if (!at) {
            this.displayCurrentRoom();
            return false;
        }

        const message = this.game.look(at);
        this.ui.displayMessage(message);
        return true;
    }

    private take(itemName: string): boolean {
        const result = this.game.take(itemName);
        const message = result.success ? 'OK.' : result.error.message;
        this.ui.displayMessage(message);
        return result.success;
    }

    private drop(itemName: string): boolean {
        const dropped = this.game.drop(itemName);
        const message = dropped ? 'OK.' : "You aren't carrying it!";
        this.ui.displayMessage(message);
        return dropped;
    }

    private changeState(target: string, value?: string): boolean {
        if (!value) return false;

        const item = this.findItem(target);
        if (!item || item.getCurrentState() === value) return false;

        item.setState(value);
        return true;
    }

    public findItem(itemName: string): Item | undefined {
        return this.game.findItem(itemName);
    }

    public displayInventory(): boolean {
        const items = this.game.getItems();
        if (items.length == 0) {
            this.ui.displayMessage("You're not carrying anything.");
            return true;
        }

        const itemMessages = items.map((item) => item.description.inventory).join('\n- ');
        const message = `You are currently holding the following:\n- ${itemMessages}`;
        this.ui.displayMessage(message);
        return true;
    }

    private displayCurrentRoom() {
        this.ui.displayRoom(this.getCurrentRoom());
    }

    private speak(value: string): boolean {
        this.ui.displayMessage(value);
        return true;
    }
}
