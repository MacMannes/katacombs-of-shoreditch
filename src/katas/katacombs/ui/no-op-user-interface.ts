/* eslint-disable @typescript-eslint/no-unused-vars */
import { Choice, UserInterface } from '@katas/katacombs/ui';
import { Room, TextWithAudioFiles } from '@katas/katacombs/domain';

export class NoOpUserInterface implements UserInterface {
    public async displayWelcomeMessage(): Promise<void> {
        // NO-OP
    }

    public displayMessage(message: TextWithAudioFiles): void {
        // NO-OP
    }

    public async displayMessageAsync(message: TextWithAudioFiles): Promise<void> {
        // NO-OP
    }

    public displayRoomTitle(room: Room): void {
        // NO-OP
    }

    public async getUserInput(): Promise<string | undefined> {
        return '';
    }

    public async getUserChoice(options: Choice[]): Promise<string> {
        return '';
    }
}
