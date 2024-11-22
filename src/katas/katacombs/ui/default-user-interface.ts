import { Room } from '../domain';
import { UserInterface } from '@katas/katacombs/ui';
import { createInterface } from 'node:readline/promises';
import wrap from 'word-wrap';

export class DefaultUserInterface implements UserInterface {
    private rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    public displayWelcomeMessage(): void {
        console.log('\n\n====================================================');
        console.log(`\x1b[33m  _  __     _                            _          
 | |/ /    | |                          | |         
 | ' / __ _| |_ __ _  ___ ___  _ __ ___ | |__  ___  
 |  < / _\` | __/ _\` |/ __/ _ \\| '_ \` _ \\| '_ \\/ __| 
 | . \\ (_| | || (_| | (_| (_) | | | | | | |_) \\__ \\ 
 |_|\\_\\__,_|\\__\\__,_|\\___\\___/|_| |_| |_|_.__/|___/ 
                          / _|                      
                     ___ | |_                       
   _____ _          / _ \\|  _|    _ _ _       _     
  / ____| |        | (_) | |     | (_) |     | |    
 | (___ | |__   ___ \\___/|_|_  __| |_| |_ ___| |__  
  \\___ \\| '_ \\ / _ \\| '__/ _ \\/ _\` | | __/ __| '_ \\ 
  ____) | | | | (_) | | |  __/ (_| | | || (__| | | |
 |_____/|_| |_|\\___/|_|  \\___|\\__,_|_|\\__\\___|_| |_|
\x1b[0m`);
        console.log('  ====================================================\n\n');
    }

    public displayRoom(room: Room): void {
        const immovableItems = room
            .getItems()
            .filter((item) => item.immovable)
            .map((item) => item.getDescription('room'))
            .join(' ');

        this.displayMessage(`${room.description} ${immovableItems}`);
        this.setWindowTitle(room.title);

        const movableItems = room
            .getItems()
            .filter((item) => !item.immovable)
            .map((item) => item.getDescription('room'))
            .join('\n');
        this.displayMessage(movableItems);
    }

    public displayMessage(message: string): void {
        console.log(wrap(message, { width: 80, indent: '' }) + '\n');
    }

    public async getUserInput(): Promise<string | undefined> {
        const userInput = await this.rl.question('> ');
        console.log('');
        return userInput;
    }

    private setWindowTitle(title: string) {
        if (process.platform == 'win32') {
            process.title = title;
        } else {
            process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
        }
    }
}
