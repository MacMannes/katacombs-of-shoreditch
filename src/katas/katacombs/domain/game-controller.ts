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

    public moveToDirection(direction: Direction) {
        const newRoom = this.game.moveToDirection(direction);
        if (!newRoom) {
            this.ui.displayMessage('There is no way to go that direction.');
        }
        this.displayCurrentRoom();
    }

    public look(subject?: Direction | string) {
        if (!subject) {
            this.displayCurrentRoom();
            return;
        }

        const message = this.game.getMessageForLookingAt(subject);
        this.ui.displayMessage(message);
    }

    public take(itemName: string) {
        const taken = this.game.take(itemName);
        const message = taken ? 'OK.' : `Can't find ${itemName} here.`;
        this.ui.displayMessage(message);
    }

    public drop(itemName: string) {
        this.game.drop(itemName);
    }

    public findItem(itemName: string): Item | undefined {
        return this.game.findItem(itemName);
    }

    public inventory(): Item[] {
        return this.game.getItems();
    }

    private displayCurrentRoom() {
        this.ui.displayRoom(this.getCurrentRoom());
    }
}
