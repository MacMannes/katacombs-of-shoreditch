import { Game, GameLoop, Item, Room } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import { InventoryCommand } from '@katas/katacombs/commands';

export class GameController {
    private readonly gameLoop: GameLoop;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        this.gameLoop = new GameLoop(game, ui);
    }

    public async startGame() {
        await this.ui.displayWelcomeMessage();
        this.displayCurrentRoom();

        await this.gameLoop.play();

        await this.ui.displayMessageAsync(this.game.getTextWithAudioFiles('msg-bye'));
    }

    private displayCurrentRoom(preferredLength?: 'short' | 'long') {
        this.ui.displayRoomTitle(this.game.getCurrentRoom());
        this.displayRoom(preferredLength);
    }

    private displayRoom(preferredLength?: 'short' | 'long') {
        const roomDescription = this.game.describeRoom(preferredLength);
        this.ui.displayMessage(roomDescription);
    }
}
