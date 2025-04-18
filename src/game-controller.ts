import { GameLoop } from 'src/domain/model/game/game-loop.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import type { UserInterface } from 'src/ui/user-interface.ts';

export class GameController {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public async startGame() {
        await this.ui.displayWelcomeMessage();
        this.displayCurrentRoom();

        await new GameLoop(this.game, this.ui).play();

        await this.ui.displayMessageAsync(
            this.game.getTextWithAudioFiles('msg-bye'),
        );
    }

    private displayCurrentRoom(preferredLength?: 'short' | 'long') {
        const currentRoom = this.game.getCurrentRoom();
        this.ui.displayRoomTitle(currentRoom.getTitle());
        this.displayRoom(preferredLength);
    }

    private displayRoom(preferredLength?: 'short' | 'long') {
        const roomDescription = this.game.describeRoom(preferredLength);
        this.ui.displayMessage(roomDescription);
    }
}
