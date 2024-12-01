/* eslint-disable @typescript-eslint/no-empty-function */
import { Room, TextWithAudioFiles } from '../domain';
import { AudioPlayer, UserInterface } from '@katas/katacombs/ui';
import { createInterface } from 'node:readline/promises';
import wrap from 'word-wrap';
import chalk from 'chalk';
import { pastel } from 'gradient-string';

export class DefaultUserInterface implements UserInterface {
    constructor(private audioPlayer: AudioPlayer) {}

    private rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    public async displayWelcomeMessage(): Promise<void> {
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
        await this.audioPlayer.play('welcome');
    }

    public async displayRoom(room: Room): Promise<void> {
        this.setWindowTitle(room.title);

        const immovableItemTextsWithAudioFiles = room
            .getItems()
            .filter((item) => item.immovable)
            .map((item) => item.getDescription('room'));

        const immovableItemsText = immovableItemTextsWithAudioFiles.map((it) => it.text).join(' ');

        const movableItemsTextsWithAudioFiles = room
            .getItems()
            .filter((item) => !item.immovable)
            .map((item) => item.getDescription('room'));

        const movableItemsText = movableItemsTextsWithAudioFiles.map((it) => it.text).join('\n\n');

        const optionalNewLines = movableItemsTextsWithAudioFiles.length > 0 ? '\n\n' : '';

        const text = `${room.getDescription()} ${immovableItemsText}${optionalNewLines}${movableItemsText}`;
        await this.displayMessage(new TextWithAudioFiles(text));

        if (room.name === 'start') {
            this.audioPlayer.play('room-start', 'item-cheese-room').catch(() => {});
        }
    }

    public async displayMessage(message: TextWithAudioFiles): Promise<void> {
        console.log(chalk.white(wrap(message.text, { width: 80, indent: '' }) + '\n'));
        if (!message.audioFiles) return;

        this.audioPlayer.play(...message.audioFiles).catch(() => {});
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
