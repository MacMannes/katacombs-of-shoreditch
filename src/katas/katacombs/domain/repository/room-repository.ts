import { Connection, oppositeOf, Room } from '@katas/katacombs/domain';
import { groupBy } from '@utils/array';

export class RoomRepository {
    private readonly roomsByName: Record<string, Room>;

    constructor(rooms: Room[]) {
        this.validateRooms(rooms);

        this.roomsByName = this.groupRooms(rooms);
        this.validateConnections();
    }

    public getRoomByName(name: string): Room {
        const room = this.findRoomByName(name);
        if (!room) throw new Error('Room does not exist');
        return room;
    }

    findRoomByName(name: string): Room | undefined {
        return this.roomsByName[name];
    }

    private validateRooms(rooms: Room[]) {
        this.ensureRoomExists(rooms, 'start');
        this.ensureUniqueProperty(rooms, 'name');
        this.ensureUniqueProperty(rooms, 'title');
    }

    private ensureUniqueProperty(rooms: Room[], propertyName: keyof Room) {
        const uniqueValues = new Set(rooms.map((room) => room[propertyName]));
        if (uniqueValues.size !== rooms.length) {
            throw new Error(`Rooms should have unique ${propertyName}s`);
        }
    }

    private groupRooms(rooms: Room[]): Record<string, Room> {
        const result: Record<string, Room> = {};

        const groupedRooms = groupBy(rooms, (room) => room.name);
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
        const roomName = room.name;

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
        const room = rooms.find((it) => it.name === roomName);
        if (!room) throw new Error(`A room with the name "${roomName}" does not exist.`);
    }
}
