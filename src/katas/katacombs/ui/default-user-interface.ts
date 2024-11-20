import { Room } from '../domain';
import { UserInterface } from '@katas/katacombs/ui';

export class DefaultUserInterface implements UserInterface {
    displayRoom(room: Room): void {
        console.log(room.description);
    }

    displayMessage(message: string): void {
        console.log(message);
    }

    getUserInput(): Promise<string | undefined> {
        throw new Error('Method not implemented.');
    }
}
