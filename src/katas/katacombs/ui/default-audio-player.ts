import { AudioPlayer, AudioQueue } from '@katas/katacombs/ui';
import path from 'node:path';
import play_sound from 'play-sound';
import { fileURLToPath } from 'node:url';
import { ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';

const player = play_sound();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DefaultAudioPlayer implements AudioPlayer {
    private currentProcess: ChildProcess | null = null;
    private hasInterruptedNarrator = false;
    private queue = new AudioQueue();

    public play(...fileNames: string[]): void {
        let playlist: string[] = [...fileNames];
        if (!this.queue.isEmpty() && this.currentProcess) {
            const interruptMessage = this.interruptNarrator();
            if (interruptMessage) {
                playlist = [interruptMessage];
            }
        }

        this.queue.clear();
        this.queue.add(...playlist);

        if (this.currentProcess) {
            this.stop();
        } else {
            this.playNext();
        }
    }

    private playNext() {
        const next = this.queue.next();
        if (next) {
            this.playFile(next);
        }
    }

    public interruptNarrator(): string | undefined {
        const randomNumber = Math.floor(Math.random() * 5) + 1;
        if (!this.hasInterruptedNarrator || randomNumber === 1) {
            this.hasInterruptedNarrator = true;
            return 'msg-narrator-interrupt-1';
        }

        return undefined;
    }

    private playFile(fileName: string): void {
        const filePath = path.join(__dirname, `../resources/audio/${fileName}.mp3`);
        if (!existsSync(filePath)) {
            this.playNext();
            return;
        }

        const process: ChildProcess = player.play(filePath);
        this.currentProcess = process;

        process.on('exit', (code) => {
            this.currentProcess = null;
            this.playNext();
        });

        process.on('error', (error) => {
            this.currentProcess = null;
        });
    }

    public async playAsync(fileName: string): Promise<void> {
        const filePath = path.join(__dirname, `../resources/audio/${fileName}.mp3`);
        return new Promise((resolve, reject) => {
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
        this.currentProcess?.kill();
        this.currentProcess = null;
    }
}
