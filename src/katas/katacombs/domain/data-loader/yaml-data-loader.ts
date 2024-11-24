import { GameData, Room, RoomData } from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';

export class YamlDataLoader {
    public async loadGameDate(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        return this.createRooms(gameData);
    }

    private createRooms(gameData: GameData): Room[] {
        const rooms = gameData.rooms.map((roomData) => this.mapRoom(roomData));

        return rooms;
    }

    private mapRoom(roomData: RoomData): Room {
        return new Room(roomData.name, roomData.title, roomData.description);
    }
}
