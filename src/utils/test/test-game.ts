import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';
import { createMockedObject } from 'src/utils/test/create-mocked-object.ts';
import { CommandProcessor } from 'src/domain/commands/command-processor.ts';
import { YamlDataLoader } from 'src/domain/data-loader/yaml-data-loader.ts';
import { GameFactory } from 'src/domain/model/game/game-factory.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { NoOpUserInterface } from 'src/ui/no-op-user-interface.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gameDataPath = path.resolve(
    __dirname,
    '../../resources/test-game-data.yaml',
); // Converts to absolute path
const gameFactory = new GameFactory(new YamlDataLoader());

export const ui = createMockedObject(NoOpUserInterface);
export let commandProcessor: CommandProcessor;
export let game: Game;

export async function createTestGame() {
    game = await gameFactory.createGame(gameDataPath);
    commandProcessor = new CommandProcessor(game, ui);
}
