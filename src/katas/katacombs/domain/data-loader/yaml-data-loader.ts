import { GameData, isDirection, Item, Room, RoomData } from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';

export class YamlDataLoader {
    public async loadGameDate(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        return gameData.rooms.map((roomData) => this.toRoom(roomData));
    }

    private toRoom(roomData: RoomData): Room {
        const room = new Room(roomData.name, roomData.title, roomData.description);

        this.addConnections(roomData, room);

        roomData.items?.forEach((item) => {
            room.addItem(
                new Item(item.name, {
                    description: {
                        room: item.description.room ?? '',
                        look: item.description.look ?? '',
                        inventory: item.description.inventory ?? '',
                    },
                    words: item.words,
                    visible: item.visible,
                    immovable: item.immovable,
                }),
            );
        });

        return room;
    }

    private addConnections(roomData: RoomData, room: Room) {
        roomData.connections?.forEach((connection) => {
            if (!isDirection(connection.direction)) return;

            room.addConnection(connection.direction, connection.to, {
                description: connection.description,
                words: connection.words,
            });
        });
    }
}
