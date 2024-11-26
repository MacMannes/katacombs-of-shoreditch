import { DefaultUserInterface } from '@katas/katacombs/ui';
import { GameController } from '@katas/katacombs/game-controller';
import { GameFactory, YamlDataLoader } from '@katas/katacombs/domain';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gameFactory = new GameFactory(new YamlDataLoader());
const gameDataPath = path.resolve(__dirname, './resources/test-game-data.yaml');
const game = await gameFactory.createGame(gameDataPath);

const controller = new GameController(game, new DefaultUserInterface());

await controller.startGame();
process.exit(0);
