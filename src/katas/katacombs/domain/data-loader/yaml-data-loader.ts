import { GameData, isDirection, Room, RoomData } from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';

export class YamlDataLoader {
    public async loadGameDate(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        return gameData.rooms.map((roomData) => this.mapRoom(roomData));
    }

    private mapRoom(roomData: RoomData): Room {
        const room = new Room(roomData.name, roomData.title, roomData.description);

        roomData?.connections?.forEach((connection) => {
            if (!isDirection(connection.direction)) return;

            room.addConnection(connection.direction, connection.to, {
                description: connection.description,
                words: connection.words,
            });
        });

        return room;
    }
}
