import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import type { Room } from 'src/domain/model/room/room.ts';
import { Command } from 'src/domain/commands/command.ts';

export class GoCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    async execute(params: string[]): Promise<boolean> {
        const to = params[0];
        if (!to) return false;

        const newRoom = this.go(to);
        if (!newRoom) {
            this.ui.displayMessage(
                this.game.getTextWithAudioFiles('msg-no-way'),
            );
            return false;
        }

        const roomDescription = this.game.describeRoom();

        this.ui.displayRoomTitle(newRoom.getTitle());
        this.ui.displayMessage(roomDescription);

        return true;
    }

    private go(to: string): Room | undefined {
        const newRoom = this.game.findRoom(to);
        if (newRoom) {
            this.game.goToRoom(newRoom);
        }
        return newRoom;
    }
}
