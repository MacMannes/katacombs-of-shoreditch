/* v8 ignore start */

import { GameController } from 'src/game-controller.ts';
import path from 'node:path';
import { getAbsolutePath, RESOURCES_PATH, GAME_DATA } from 'src/paths.ts';
import { GameFactory } from 'src/domain/model/game/game-factory.ts';
import { YamlDataLoader } from 'src/domain/data-loader/yaml-data-loader.ts';
import { DefaultUserInterface } from 'src/ui/default-user-interface.ts';
import { DefaultAudioPlayer } from 'src/ui/default-audio-player.ts';

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
