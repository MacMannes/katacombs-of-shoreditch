import { Game, GameLoop } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class GameController {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public async startGame() {
        await this.ui.displayWelcomeMessage();
        this.displayCurrentRoom();

        await new GameLoop(this.game, this.ui).play();

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
