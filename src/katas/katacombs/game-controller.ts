import { CommandHandler, Game, Item, Room } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class GameController {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public startGame(): void {
        this.displayCurrentRoom();
    }

    public getCurrentRoom(): Room {
        return this.game.getCurrentRoom();
    }

    public getInventory(): Item[] {
        return this.game.getItems();
    }

    public processCommand(verb: string, target?: string) {
        const handler = this.getCommandHandler(verb, target);
        if (!handler) {
            this.ui.displayMessage('What?');
            return;
        }

        handler.handle(target ?? '');
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
        go: { handle: (target) => this.go(target) }, // requiresTarget defaults to true
        look: { requiresTarget: false, handle: (target) => this.look(target) }, // explicit no target
        take: { handle: (target) => this.take(target) },
        drop: { handle: (target) => this.drop(target) },
    };

    private go(to: string) {
        const newRoom = this.game.go(to);
        if (!newRoom) {
            this.ui.displayMessage('There is no way to go that direction.');
        }
        this.displayCurrentRoom();
    }

    private look(at?: string) {
        if (!at) {
            this.displayCurrentRoom();
            return;
        }

        const message = this.game.look(at);
        this.ui.displayMessage(message);
    }

    private take(itemName: string) {
        const result = this.game.take(itemName);
        const message = result.success ? 'OK.' : result.error.message;
        this.ui.displayMessage(message);
    }

    private drop(itemName: string) {
        const dropped = this.game.drop(itemName);
        const message = dropped ? 'OK.' : "You aren't carrying it!";
        this.ui.displayMessage(message);
    }

    public findItem(itemName: string): Item | undefined {
        return this.game.findItem(itemName);
    }

    public displayInventory(): void {
        const items = this.game.getItems();
        if (items.length == 0) {
            this.ui.displayMessage("You're not carrying anything.");
            return;
        }

        const itemMessages = items.map((item) => item.description.inventory).join('\n');
        const message = `You are currently holding the following:\n${itemMessages}`;
        this.ui.displayMessage(message);
    }

    private displayCurrentRoom() {
        this.ui.displayRoom(this.getCurrentRoom());
    }
}
