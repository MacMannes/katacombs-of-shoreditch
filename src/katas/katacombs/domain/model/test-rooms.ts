import { Room, YamlDataLoader } from '@katas/katacombs/domain';
import path from 'node:path';

export async function createTestRooms(): Promise<Room[]> {
    const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
    const loader = new YamlDataLoader();
    return loader.loadGameFromFile(gameDataPath);
}
