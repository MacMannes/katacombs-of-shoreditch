/* v8 ignore start */

import { DefaultAudioPlayer, DefaultUserInterface } from 'src/ui';
import { GameController } from 'src/game-controller';
import { GameFactory, YamlDataLoader } from 'src/domain';
import path from 'node:path';
import { getAbsolutePath, RESOURCES_PATH, GAME_DATA } from 'src/paths';

async function createGameController() {
    const gameFactory = new GameFactory(new YamlDataLoader());
    const game = await gameFactory.createGame(
        getAbsolutePath(path.join(RESOURCES_PATH, GAME_DATA)),
    );

    return new GameController(
        game,
        new DefaultUserInterface(new DefaultAudioPlayer()),
    );
}

async function startGame() {
    const controller = await createGameController();

    await controller.startGame();
    process.exit(0);
}

await startGame();

/* v8 ignore end */
