import {
    ActionTrigger,
    ActionTriggerData,
    GameData,
    isDirection,
    Item,
    ItemData,
    Room,
    RoomData,
} from '@katas/katacombs/domain';
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

        this.addConnections(roomData, room);

        room.addItems(this.mapItems(roomData.items));

        return room;
    }

    private mapItems(items?: ItemData[]): Item[] {
        if (!items) return [];

        return items.map((item) => this.mapItem(item));
    }

    private mapItem(item: ItemData): Item {
        return new Item(item.name, {
            description: {
                room: item.description.room ?? '',
                look: item.description.look ?? '',
                inventory: item.description.inventory ?? '',
            },
            words: item.words,
            visible: item.visible,
            immovable: item.immovable,
            triggers: this.mapTriggers(item.triggers),
        });
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

    private mapTriggers(triggers: ActionTriggerData[] | undefined): ActionTrigger[] | undefined {
        if (!triggers) return undefined;

        return triggers.map((trigger) => ({
            verb: trigger.verb,
            actions: trigger.actions.map((action) => ({
                command: action.command,
                argument: action.argument,
                parameter: action.parameter,
                responses: action.responses,
            })),
        }));
    }
}
