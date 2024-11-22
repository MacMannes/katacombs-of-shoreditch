import { Room } from '../domain';
import { UserInterface } from '@katas/katacombs/ui';
import { createInterface } from 'node:readline/promises';
import wrap from 'word-wrap';
import chalk from 'chalk';
import { pastel } from 'gradient-string';

export class DefaultUserInterface implements UserInterface {
    private rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    public displayWelcomeMessage(): void {
        console.log('\n\n====================================================');
        const title = `  _  __     _                            _          
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
 |_____/|_| |_|\\___/|_|  \\___|\\__,_|_|\\__\\___|_| |_|`;
        console.log(pastel.multiline(title));
        console.log('====================================================\n\n');
    }

    public displayRoom(room: Room): void {
        this.setWindowTitle(room.title);

        const immovableItems = room
            .getItems()
            .filter((item) => item.immovable)
            .map((item) => item.getDescription('room'))
            .join(' ');

        this.displayMessage(`${room.description} ${immovableItems}`);

        const movableItems = room
            .getItems()
            .filter((item) => !item.immovable)
            .map((item) => item.getDescription('room'))
            .join('\n\n');
        if (movableItems.length > 0) {
            this.displayMessage(movableItems);
        }
    }

    public displayMessage(message: string): void {
        console.log(chalk.white(wrap(message, { width: 80, indent: '' }) + '\n'));
    }

    public async getUserInput(): Promise<string | undefined> {
        const userInput = await this.rl.question(chalk.greenBright.bold('❯ '));
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
