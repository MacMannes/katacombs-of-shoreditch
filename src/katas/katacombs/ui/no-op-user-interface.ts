/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserInterface } from '@katas/katacombs/ui';
import { Room, TextWithAudioFiles } from '@katas/katacombs/domain';

export class NoOpUserInterface implements UserInterface {
    public async displayWelcomeMessage(): Promise<void> {
        // NO-OP
    }

    public async displayMessage(message: TextWithAudioFiles): Promise<void> {
        // NO-OP
    }

    public async displayRoomTitle(room: Room): Promise<void> {
        // NO-OP
    }

    public async displayRoom(room: Room): Promise<void> {
        // NO-OP
    }

    public async getUserInput(): Promise<string | undefined> {
        return '';
    }
}
