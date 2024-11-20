import { Room } from '../domain';
import { UserInterface } from '@katas/katacombs/ui';

export class DefaultUserInterface implements UserInterface {
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
