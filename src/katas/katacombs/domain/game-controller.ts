import { Direction, Game, isDirection, Item, Room } from '@katas/katacombs/domain/model';
import { UserInterface } from '@katas/katacombs/domain/ui';

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

    public getInventory(): Item[] {
        return [
            {
                name: 'keys',
                descriptions: {
                    inventory: '',
                    room: '',
                    look: '',
                },
            },
        ];
    }

    private displayCurrentRoom() {
        this.ui.displayRoom(this.getCurrentRoom());
    }
}
