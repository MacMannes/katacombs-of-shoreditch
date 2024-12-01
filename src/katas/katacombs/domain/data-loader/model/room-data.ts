import { ConnectionData, Room, toConnections, toItems } from '@katas/katacombs/domain';
import { ItemData } from '@katas/katacombs/domain';

export type RoomData = {
    name: string;
    title: string;
    description: string;
    shortDescription?: string;
    connections?: ConnectionData[];
    items?: ItemData[];
};

export function toRoom(roomData: RoomData): Room {
    const room = new Room(roomData.name, roomData.title, roomData.description, roomData.shortDescription);

    room.addConnections(toConnections(roomData.connections));
    room.addItems(toItems(roomData.items));

    return room;
}
