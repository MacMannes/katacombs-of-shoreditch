import { AudioPlayer } from '@katas/katacombs/ui/audio-player';

export class DefaultAudioPlayer implements AudioPlayer {
    play(fileName: string): Promise<void> {
        return Promise.resolve();
    }
}
