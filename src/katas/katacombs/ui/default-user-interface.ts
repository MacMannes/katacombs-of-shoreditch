import { Room } from '../domain';
import { UserInterface } from '@katas/katacombs/ui';
import { createInterface } from 'node:readline/promises';

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
        console.log('====================================================\n\n');
    }

    public displayRoom(room: Room): void {
        this.displayMessage(room.description);
        this.setWindowTitle(room.title);
    }

    public displayMessage(message: string): void {
        console.log(message + '\n');
    }

    public async getUserInput(): Promise<string | undefined> {
        return this.rl.question('> ');
    }

    private setWindowTitle(title: string) {
        if (process.platform == 'win32') {
            process.title = title;
        } else {
            process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
        }
    }
}
