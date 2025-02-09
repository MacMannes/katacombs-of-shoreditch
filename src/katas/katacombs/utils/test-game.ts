import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';
import { Game, GameFactory, YamlDataLoader } from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';
import { NoOpUserInterface } from '@katas/katacombs/ui';
import { CommandProcessor } from '@katas/katacombs/commands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gameDataPath = path.resolve(__dirname, '../resources/test-game-data.yaml'); // Converts to absolute path
const gameFactory = new GameFactory(new YamlDataLoader());

export const ui = createMockedObject(NoOpUserInterface);
export let processor: CommandProcessor;
export let game: Game;

export async function createTestGame() {
    game = await gameFactory.createGame(gameDataPath);
    processor = new CommandProcessor(game, ui);
}
