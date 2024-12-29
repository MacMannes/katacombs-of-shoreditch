import { Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class GoCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    async execute(params: string[]): Promise<boolean> {
        const to = params[0];

        const newRoom = this.game.go(to);
        if (!newRoom) {
            this.ui.displayMessage(this.game.getTextWithAudioFiles('msg-no-way'));
            return false;
        }

        const roomDescription = this.game.describeRoom();

        this.ui.displayRoomTitle(this.game.getCurrentRoom());
        this.ui.displayMessage(roomDescription);

        return true;
    }
}
