/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserInterface } from '@katas/katacombs/ui';
import { Room } from '@katas/katacombs/domain';

export class NoOpUserInterface implements UserInterface {
    public displayWelcomeMessage(): void {
        // NO-OP
    }

    public displayMessage(message: string): void {
        // NO-OP
    }

    public displayRoom(room: Room): void {
        // NO-OP
    }

    public async getUserInput(): Promise<string | undefined> {
        return '';
    }
}
