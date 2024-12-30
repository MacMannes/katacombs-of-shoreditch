import { Room, TextWithAudioFiles } from '../domain';
import { AudioPlayer, Choice, UserInterface } from '@katas/katacombs/ui';
import { createInterface } from 'node:readline/promises';
import wrap from 'word-wrap';
import chalk from 'chalk';
import { pastel } from 'gradient-string';

export class DefaultUserInterface implements UserInterface {
    private rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    constructor(private audioPlayer: AudioPlayer) {}

    public async displayWelcomeMessage(): Promise<void> {
        this.setWindowTitle('Welcome to Katacombs of Shoreditch');
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
        await this.audioPlayer.playAsync('welcome');
    }

    public displayRoomTitle(room: Room): void {
        this.setWindowTitle(room.title);
    }

    public displayMessage(message: TextWithAudioFiles): void {
        this.displayText(message.text);

        if (!message.audioFiles) return;
        this.audioPlayer.play(...message.audioFiles);
    }

    public async displayMessageAsync(message: TextWithAudioFiles): Promise<void> {
        this.displayText(message.text);

        const audioFile = message.audioFiles?.at(0);
        if (!audioFile) return;

        await this.audioPlayer.playAsync(audioFile);
    }

    private displayText(text: string) {
        console.log(chalk.whiteBright(wrap(text, { width: 80, indent: '' }) + '\n'));
    }

    public async getUserInput(): Promise<string | undefined> {
        const userInput = await this.rl.question(chalk.greenBright.bold('❯ '));
        console.log('');
        return userInput;
    }

    public async getUserChoice(options: Choice[]): Promise<string | undefined> {
        const text = '\n- ' + options.map((it) => it.text).join('\n- ');

        this.displayText(text);
        return '';
    }

    private setWindowTitle(title: string) {
        if (process.platform == 'win32') {
            process.title = title;
        } else {
            process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
        }
    }
}
