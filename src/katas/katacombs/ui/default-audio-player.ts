import { AudioPlayer } from '@katas/katacombs/ui/audio-player';
import path from 'node:path';
import play_sound from 'play-sound';
import { fileURLToPath } from 'node:url';
import { ChildProcess } from 'node:child_process';

const player = play_sound();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DefaultAudioPlayer implements AudioPlayer {
    public async play(fileName: string): Promise<void> {
        const filePath = path.join(__dirname, `../resources/sounds/${fileName}.mp3`);
        return new Promise((resolve, reject) => {
            const child: ChildProcess = player.play(filePath);

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(); // Playback finished successfully
                } else {
                    reject(new Error(`Playback failed with exit code ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error); // Handle any process errors
            });
        });
    }
}
