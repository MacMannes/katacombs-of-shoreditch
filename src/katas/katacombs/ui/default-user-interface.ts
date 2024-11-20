import { Room } from '../domain';
import { UserInterface } from '@katas/katacombs/ui';

export class DefaultUserInterface implements UserInterface {
    public displayWelcomeMessage(): void {
        // NO-OP
    }

    public displayRoom(room: Room): void {
        console.log(room.description);
        this.setWindowTitle(room.title);
    }

    public displayMessage(message: string): void {
        console.log(message);
    }

    public async getUserInput(): Promise<string | undefined> {
        throw new Error('Method not implemented.');
    }

    private setWindowTitle(title: string) {
        if (process.platform == 'win32') {
            process.title = title;
        } else {
            console.log('\x1b]2;' + title + '\x1b\x5c');
        }
    }
}
