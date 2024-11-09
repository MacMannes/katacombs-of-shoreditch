import { Direction, Game, Item, Room, UserInterface } from '@katas/katacombs/domain';

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

    public go(to: Direction) {
        const newRoom = this.game.go(to);
        if (!newRoom) {
            this.ui.displayMessage('There is no way to go that direction.');
        }
        this.displayCurrentRoom();
    }

    public look(at?: Direction | string) {
        if (!at) {
            this.displayCurrentRoom();
            return;
        }

        const message = this.game.look(at);
        this.ui.displayMessage(message);
    }

    public take(itemName: string) {
        const taken = this.game.take(itemName);
        const message = taken ? 'OK.' : `Can't find ${itemName} here.`;
        this.ui.displayMessage(message);
    }

    public drop(itemName: string) {
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

        const itemMessages = items.map((item) => item.descriptions.inventory).join('\n');
        const message = `You are currently holding the following:\n${itemMessages}`;
        this.ui.displayMessage(message);
    }

    private displayCurrentRoom() {
        this.ui.displayRoom(this.getCurrentRoom());
    }
}
