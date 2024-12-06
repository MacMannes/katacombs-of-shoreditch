import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';

export const RESOURCES_PATH = './resources';
export const TEST_GAME_DATA = 'test-game-data.yaml';

export function getAbsolutePath(relativePath: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return path.resolve(__dirname, relativePath);
}
