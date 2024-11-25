import {
    ActionTrigger,
    ActionTriggerData,
    Connection,
    ConnectionData,
    GameData,
    isDirection,
    Item,
    ItemData,
    Room,
    RoomData,
} from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';
import { isDefined } from '@utils/array';

export class YamlDataLoader {
    public async loadGameFromFile(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        return gameData.rooms.map((roomData) => this.toRoom(roomData));
    }

    private toRoom(roomData: RoomData): Room {
        const room = new Room(roomData.name, roomData.title, roomData.description);

        room.addConnections(this.mapConnections(roomData.connections));
        room.addItems(this.mapItems(roomData.items));

        return room;
    }

    private mapConnections(connections?: ConnectionData[] | undefined): Connection[] {
        if (!connections) return [];

        return connections.map((connection) => this.mapConnection(connection)).filter(isDefined);
    }

    private mapConnection(connection: ConnectionData): Connection | undefined {
        if (!isDirection(connection.direction)) return undefined;

        return new Connection(connection.direction, connection.to, {
            description: connection.description,
            words: connection.words,
        });
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
