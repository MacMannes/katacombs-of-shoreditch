import { toItems, ConnectionData, ItemData, Room, toConnections, NpcData, toNPC } from '@katas/katacombs/domain';
import { isDefined } from '@utils/array';

export type RoomData = {
    name: string;
    title: string;
    description: string;
    'short-description'?: string;
    connections?: ConnectionData[];
    items?: ItemData[];
    npcs?: string[];
};

export function toRoom(roomData: RoomData, globalItems: ItemData[], globalNpcs: NpcData[]): Room {
    const room = new Room(roomData.name, roomData.title, roomData.description, roomData['short-description']);

    room.addConnections(toConnections(roomData.connections));
    room.addItems(toItems(globalItems, roomData.items));
    const npcs = roomData.npcs
        ?.map((name) => globalNpcs.find((npc) => npc.name === name))
        ?.filter(isDefined)
        ?.map((npc) => toNPC(npc));
    if (npcs) {
        room.addNpcs(npcs);
    }

    return room;
}
