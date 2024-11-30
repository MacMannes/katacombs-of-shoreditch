import { DefaultAudioPlayer, DefaultUserInterface } from '@katas/katacombs/ui';
import { GameController } from '@katas/katacombs/game-controller';
import { GameFactory, YamlDataLoader } from '@katas/katacombs/domain';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';

const GAME_DATA_PATH = './resources/test-game-data.yaml';

function getAbsolutePath(relativePath: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return path.resolve(__dirname, relativePath);
}

async function createGameController() {
    const gameFactory = new GameFactory(new YamlDataLoader());
    const game = await gameFactory.createGame(getAbsolutePath(GAME_DATA_PATH));

    return new GameController(game, new DefaultUserInterface(new DefaultAudioPlayer()));
}

async function startGame() {
    const controller = await createGameController();

    await controller.startGame();
    process.exit(0);
}

await startGame();
