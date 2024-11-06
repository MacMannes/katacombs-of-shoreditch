import { Direction, Game } from '@katas/katacombs/domain/model';
import { UserInterface } from '@katas/katacombs/domain/ui';

export class GameController {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public startGame(): void {
        this.displayCurrentRoom();
    }

    public moveToDirection(direction: Direction) {
        const newRoom = this.game.moveToDirection(direction);
        if (!newRoom) {
            this.ui.displayMessage('There is no way to go that direction.');
        }
        this.displayCurrentRoom();
    }

    public look(direction?: Direction) {
        if (direction) {
            const connection = this.game.getCurrentRoom().findConnection(direction);
            if (connection) {
                this.ui.displayMessage(
                    'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
                );
            } else {
                this.ui.displayMessage('Nothing interesting to look at there.');
            }
        }
        this.displayCurrentRoom();
    }

    private displayCurrentRoom() {
        this.ui.displayRoom(this.game.getCurrentRoom());
    }
}
