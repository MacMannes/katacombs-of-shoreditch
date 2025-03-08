import { Connection, Item, oppositeOf, Room } from '@katas/katacombs/domain';
import { groupBy, isDefined } from '@katas/katacombs/utils/array';

export class RoomRepository {
    private readonly roomsByName: Record<string, Room>;

    constructor(rooms: Room[]) {
        this.validateRooms(rooms);
        this.validateItemsInRooms(rooms);

        this.roomsByName = this.groupRooms(rooms);
        this.validateConnections();
    }

    public getRoomByName(name: string): Room {
        const room = this.findRoomByName(name);
        if (!room) throw new Error('Room does not exist');
        return room;
    }

    public findRoomByName(name: string): Room | undefined {
        return this.roomsByName[name];
    }

    private validateRooms(rooms: Room[]) {
        this.ensureRoomExists(rooms, 'start');
        this.ensureUniqueNameInRooms(rooms);
        this.ensureUniqueTitleInRooms(rooms);
    }

    private validateItemsInRooms(rooms: Room[]) {
        const items = rooms.flatMap((room) => room.getItems());
        this.ensureUniqueItemNames(items);
        this.ensureUniqueInventoryDescriptionsInItems(items);
    }

    private ensureUniqueNameInRooms(rooms: Room[]) {
        const uniqueValues = new Set(rooms.map((room) => room.getName()));
        if (uniqueValues.size !== rooms.length) {
            throw new Error(`Rooms should have unique names`);
        }
    }

    private ensureUniqueTitleInRooms(rooms: Room[]) {
        const uniqueValues = new Set(rooms.map((room) => room.getTitle()));
        if (uniqueValues.size !== rooms.length) {
            throw new Error(`Rooms should have unique titles`);
        }
    }

    private ensureUniqueItemNames(items: Item[]) {
        const uniqueValues = new Set(items.map((item) => item.name));
        if (uniqueValues.size !== items.length) {
            throw new Error(`Items should have unique names`);
        }
    }

    private ensureUniqueInventoryDescriptionsInItems(items: Item[]) {
        const descriptions = items
            .filter((item) => !item.immovable)
            .map((item) => item.getDescription('inventory').at(0))
            .filter(isDefined);

        if (!this.hasUniqueStrings(descriptions)) {
            throw new Error(`Items should have unique inventory descriptions`);
        }
    }

    private hasUniqueStrings(array: string[]): boolean {
        return new Set(array).size === array.length;
    }
    private groupRooms(rooms: Room[]): Record<string, Room> {
        const result: Record<string, Room> = {};

        const groupedRooms = groupBy(rooms, (room) => room.getName());
        for (const name in groupedRooms) {
            const roomToAdd = groupedRooms[name];

            result[name] = roomToAdd[0];
        }

        return result;
    }

    private validateConnections() {
        for (const room of Object.values(this.roomsByName)) {
            this.validateConnectionsOfRoom(room);
        }
    }

    private validateConnectionsOfRoom(room: Room) {
        const roomName = room.getName();

        room.getConnections().forEach((connection) => {
            this.validateConnection(connection, roomName);
        });
    }

    private validateConnection(connection: Connection, fromRoomName: string) {
        const connectedRoomName = connection.roomName;
        const connectionDescription = `connection from ${fromRoomName} to ${connectedRoomName}`;

        const connectedRoom = this.findRoomByName(connectedRoomName);
        if (!connectedRoom) {
            throw new Error(`Invalid ${connectionDescription}. Room ${connectedRoomName} does not exist.`);
        }

        const reversedConnection = connectedRoom.findConnection(oppositeOf(connection.direction), fromRoomName);
        if (!reversedConnection) {
            throw new Error(`The ${connectionDescription} is not reversed.`);
        }
    }

    private ensureRoomExists(rooms: Room[], roomName: string) {
        const room = rooms.find((it) => it.getName() === roomName);
        if (!room) throw new Error(`A room with the name "${roomName}" does not exist.`);
    }
}
