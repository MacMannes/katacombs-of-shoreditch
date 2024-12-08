import { CommandExecuteOptions, Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class GoCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    execute(options?: CommandExecuteOptions): boolean {
        const to = options?.params?.at(0);
        if (!to) return false;

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
