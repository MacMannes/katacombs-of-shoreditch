import type { DataLoader } from 'src/domain/data-loader/data-loader.ts';
import { ItemRepository } from 'src/domain/repository/item-repository.ts';
import { RoomRepository } from 'src/domain/repository/room-repository.ts';
import { TextRepository } from 'src/domain/repository/text-repository.ts';
import { Game } from 'src/domain/model/game/game.ts';

export class GameFactory {
    constructor(private readonly dataLoader: DataLoader) {}

    async createGame(filePath: string): Promise<Game> {
        const realm = await this.dataLoader.load(filePath);
        const roomRepository = new RoomRepository(realm.rooms);
        const textRepository = new TextRepository(realm.texts);

        return new Game(roomRepository, new ItemRepository(), textRepository);
    }
}
