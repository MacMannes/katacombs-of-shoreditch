import { Connection, oppositeOf, Room } from '@katas/katacombs/domain/model';
import { UserInterface } from '@katas/katacombs/domain/ui';
import { groupBy } from '@utils/array';

export class Game {
    private readonly roomsByName: Record<string, Room> = {};

    constructor(
        private readonly ui: UserInterface,
        rooms: Room[],
    ) {
        this.validateRooms(rooms);
        this.roomsByName = this.groupRooms(rooms);
        this.validateConnections();
    }

    public start(): void {
        this.ui.displayRoom(this.roomsByName['start']);
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

    private validateRooms(rooms: Room[]) {
        this.ensureUniqueProperty(rooms, 'name');
        this.ensureUniqueProperty(rooms, 'title');
    }

    private ensureUniqueProperty(rooms: Room[], propertyName: keyof Room) {
        const uniqueValues = new Set(rooms.map((room) => room[propertyName]));
        if (uniqueValues.size !== rooms.length) {
            throw new Error(`Rooms should have unique ${propertyName}s`);
        }
    }

    private validateConnections() {
        for (const room of Object.values(this.roomsByName)) {
            this.validateConnectionsOfRoom(room);
        }
    }

    private validateConnectionsOfRoom(room: Room) {
        const roomName = room.name;

        room.connections.forEach((connection) => {
            this.validateConnection(connection, roomName);
        });
    }

    private validateConnection(connection: Connection, fromRoomName: string) {
        const connectedRoomName = connection.roomName;
        const connectionDescription = `connection from ${fromRoomName} to ${connectedRoomName}`;

        const connectedRoom = this.roomsByName[connectedRoomName];
        if (!connectedRoom) {
            throw new Error(`Invalid ${connectionDescription}. Room ${connectedRoomName} does not exist.`);
        }

        const reversedConnection = connectedRoom.findConnection(oppositeOf(connection.direction), fromRoomName);
        if (!reversedConnection) {
            throw new Error(`The ${connectionDescription} is not reversed.`);
        }
    }
}
