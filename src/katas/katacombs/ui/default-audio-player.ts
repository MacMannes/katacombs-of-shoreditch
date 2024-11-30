import { AudioPlayer } from '@katas/katacombs/ui/audio-player';

export class DefaultAudioPlayer implements AudioPlayer {
    public async play(fileName: string): Promise<void> {
        return Promise.resolve();
    }
}
