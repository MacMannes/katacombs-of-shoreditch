import { DataLoader, Game, ItemRepository, RoomRepository } from '@katas/katacombs/domain';

export class GameFactory {
    constructor(private readonly dataLoader: DataLoader) {}

    async createGame(filePath: string): Promise<Game> {
        const rooms = await this.dataLoader.load(filePath);
        const roomRepository = new RoomRepository(rooms);

        return new Game(roomRepository, new ItemRepository());
    }
}
