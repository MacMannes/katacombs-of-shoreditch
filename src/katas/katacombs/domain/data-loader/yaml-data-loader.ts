import { GameData, Item, ItemData, Room, RoomData, toConnections, toItems, toTriggers } from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';

export class YamlDataLoader {
    public async loadGameFromFile(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        return gameData.rooms.map((roomData) => this.toRoom(roomData));
    }

    private toRoom(roomData: RoomData): Room {
        const room = new Room(roomData.name, roomData.title, roomData.description);

        room.addConnections(toConnections(roomData.connections));
        room.addItems(toItems(roomData.items));

        return room;
    }
}
