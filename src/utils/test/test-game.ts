import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';
import { Game, GameFactory, YamlDataLoader } from '../../domain';
import { NoOpUserInterface } from '../../ui';
import { CommandProcessor } from '../../domain/commands';
import { createMockedObject } from './create-mocked-object';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
const gameFactory = new GameFactory(new YamlDataLoader());

export const ui = createMockedObject(NoOpUserInterface);
export let commandProcessor: CommandProcessor;
export let game: Game;

export async function createTestGame() {
    game = await gameFactory.createGame(gameDataPath);
    commandProcessor = new CommandProcessor(game, ui);
}
