import { DefaultUserInterface } from '@katas/katacombs/ui';
import { GameController } from '@katas/katacombs/game-controller';
import { createTestRooms, Game, ItemRepository, RoomRepository } from '@katas/katacombs/domain';

const ui = new DefaultUserInterface();
const testRooms = await createTestRooms();
const roomRepository = new RoomRepository(testRooms);
const itemRepository = new ItemRepository();
const game = new Game(roomRepository, itemRepository);
const controller = new GameController(game, ui);

await controller.startGame();
process.exit(0);
