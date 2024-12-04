/* eslint-disable @typescript-eslint/no-empty-function */
import { Room, TextWithAudioFiles } from '../domain';
import { AudioPlayer, UserInterface } from '@katas/katacombs/ui';
import { createInterface } from 'node:readline/promises';
import wrap from 'word-wrap';
import chalk from 'chalk';
import { pastel } from 'gradient-string';
import { isDefined } from '@utils/array';

export class DefaultUserInterface implements UserInterface {
    private hasInterruptedNarrator: boolean = false;

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

    public async displayRoomTitle(room: Room): Promise<void> {
        this.setWindowTitle(room.title);
    }

    public async displayMessage(message: TextWithAudioFiles): Promise<void> {
        console.log(chalk.white(wrap(message.text, { width: 80, indent: '' }) + '\n'));

        if (!message.audioFiles) return;
        this.audioPlayer.play(...message.audioFiles);
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

    private interruptNarrator(): string | undefined {
        const randomNumber = Math.floor(Math.random() * 20) + 1;
        if (!this.hasInterruptedNarrator || randomNumber === 1) {
            this.hasInterruptedNarrator = true;
            return 'msg-narrator-interrupt-1';
        }

        return undefined;
    }
}
