import { AudioPlayer } from '@katas/katacombs/ui/audio-player';
import path from 'node:path';
import play_sound from 'play-sound';
import { fileURLToPath } from 'node:url';
import { ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { isDefined } from '@utils/array';

const player = play_sound();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DefaultAudioPlayer implements AudioPlayer {
    private currentProcess: ChildProcess | null = null;
    private hasInterruptedNarrator = false;
    private isPlaying = false;

    public async play(...fileNames: string[]): Promise<void> {
        if (this.isPlaying) {
            this.stop();
        }

        this.isPlaying = true;

        for (const fileName of fileNames) {
            if (this.isPlaying) {
                try {
                    await this.playFile(fileName);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                    break;
                }
            }
        }

        this.isPlaying = false;
    }

    public interruptNarrator(): string | undefined {
        const randomNumber = Math.floor(Math.random() * 20) + 1;
        if (!this.hasInterruptedNarrator || randomNumber === 1) {
            this.hasInterruptedNarrator = true;
            return 'msg-narrator-interrupt-1';
        }

        return undefined;
    }

    private async playFile(fileName: string): Promise<void> {
        const filePath = path.join(__dirname, `../resources/sounds/${fileName}.mp3`);
        if (!existsSync(filePath)) return;

        return new Promise((resolve, reject) => {
            this.isPlaying = true;

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

        this.currentProcess.kill('SIGINT');
        this.currentProcess = null;
        this.isPlaying = false;
    }
}
