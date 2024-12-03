import { DataLoader, Game, ItemRepository, RoomRepository, TextRepository } from '@katas/katacombs/domain';

export class GameFactory {
    constructor(private readonly dataLoader: DataLoader) {}

    async createGame(filePath: string): Promise<Game> {
        const realm = await this.dataLoader.load(filePath);
        const roomRepository = new RoomRepository(realm.rooms);
        const textRepository = new TextRepository(realm.texts);

        return new Game(roomRepository, new ItemRepository(), textRepository);
    }
}
