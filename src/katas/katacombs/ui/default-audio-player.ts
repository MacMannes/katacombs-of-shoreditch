import { AudioPlayer } from '@katas/katacombs/ui/audio-player';
import path from 'node:path';
import play_sound from 'play-sound';
import { fileURLToPath } from 'node:url';
import { ChildProcess } from 'node:child_process';

const player = play_sound();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DefaultAudioPlayer implements AudioPlayer {
    private currentProcess: ChildProcess | null = null;

    public async play(...fileNames: string[]): Promise<void> {
        if (this.currentProcess) {
            this.stop();
        }

        for (const fileName of fileNames) {
            try {
                await this.playFile(fileName);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                break;
            }
        }
    }

    private async playFile(fileName: string): Promise<void> {
        const filePath = path.join(__dirname, `../resources/sounds/${fileName}.mp3`);
        return new Promise((resolve, reject) => {
            if (this.currentProcess) {
                this.currentProcess.kill();
            }

            const process: ChildProcess = player.play(filePath);
            this.currentProcess = process;

            process.on('close', (code) => {
                if (code === 0) {
                    this.currentProcess = null;
                    resolve();
                } else {
                    this.currentProcess = null;
                    reject(new Error(`Playback failed for ${fileName} with exit code ${code}`));
                }
            });

            process.on('error', (error) => {
                this.currentProcess = null;
                reject(error);
            });
        });
    }

    public stop(): void {
        if (!this.currentProcess) return;

        this.currentProcess.kill();
        this.currentProcess = null;
    }
}
