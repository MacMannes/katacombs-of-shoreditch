import { toItems, ConnectionData, ItemData, Room, toConnections } from '@katas/katacombs/domain';

export type RoomData = {
    name: string;
    title: string;
    description: string;
    shortDescription?: string;
    connections?: ConnectionData[];
    items?: ItemData[];
};

export function toRoom(roomData: RoomData, globalItems: ItemData[]): Room {
    const room = new Room(roomData.name, roomData.title, roomData.description, roomData.shortDescription);

    room.addConnections(toConnections(roomData.connections));
    room.addItems(toItems(globalItems, roomData.items));

    return room;
}
