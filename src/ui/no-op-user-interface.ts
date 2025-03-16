/* v8 ignore start */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { TextWithAudioFiles } from 'src/domain/model/text-with-audio-files.ts';
import type { UserInterface, Choice } from 'src/ui/user-interface.ts';

export class NoOpUserInterface implements UserInterface {
    public async displayWelcomeMessage(): Promise<void> {
        // NO-OP
    }

    public displayMessage(message: TextWithAudioFiles): void {
        // NO-OP
    }

    public async displayMessageAsync(
        message: TextWithAudioFiles,
    ): Promise<void> {
        // NO-OP
    }

    public displayRoomTitle(title: string): void {
        // NO-OP
    }

    public async getUserInput(): Promise<string | undefined> {
        return '';
    }

    public async getUserChoice(options: Choice[]): Promise<string> {
        return '';
    }
}
/* v8 ignore end */
