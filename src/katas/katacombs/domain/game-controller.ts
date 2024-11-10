import { CommandHandler, Game, Item, Room, UserInterface } from '@katas/katacombs/domain';

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

    public processCommand(verb: string, subject?: string) {
        const handler = this.getCommandHandler(verb, subject);
        if (!handler) {
            this.ui.displayMessage('What?');
            return;
        }

        handler.handle(subject ?? '');
    }

    private getCommandHandler(verb: string, subject?: string): CommandHandler | undefined {
        const handler = this.commandHandlers[verb];
        if (!handler) return undefined;

        const requiresSubject = handler.requiresSubject ?? true;
        if (requiresSubject && !subject) {
            return undefined;
        }

        return handler;
    }

    private commandHandlers: Record<string, CommandHandler> = {
        go: { handle: (subject) => this.go(subject) }, // requiresSubject defaults to true
        look: { requiresSubject: false, handle: (subject) => this.look(subject) }, // explicit no subject
        take: { handle: (subject) => this.take(subject) },
        drop: { handle: (subject) => this.drop(subject) },
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
        const taken = this.game.take(itemName);
        const message = taken ? 'OK.' : `Can't find ${itemName} here.`;
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
