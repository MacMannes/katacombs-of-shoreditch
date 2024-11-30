import { AudioPlayer } from '@katas/katacombs/ui/audio-player';
import path from 'node:path';
import play_sound from 'play-sound';
import { fileURLToPath } from 'node:url';

const player = play_sound();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DefaultAudioPlayer implements AudioPlayer {
    public async play(fileName: string): Promise<void> {
        const filePath = path.join(__dirname, `../resources/sounds/${fileName}.mp3`);
        player.play(filePath);
    }
}
