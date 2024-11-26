import { Room, YamlDataLoader } from '@katas/katacombs/domain';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createTestRooms(): Promise<Room[]> {
    const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
    const loader = new YamlDataLoader();
    return loader.load(gameDataPath);
}
