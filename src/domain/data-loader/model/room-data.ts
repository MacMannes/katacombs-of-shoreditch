import { Room } from 'src/domain/model/room/room.ts';
import { isDefined } from 'src/utils/array/array-utils.ts';
import {
    type ConnectionData,
    toConnections,
} from 'src/domain/data-loader/model/connection-data.ts';
import {
    type ItemData,
    toItems,
} from 'src/domain/data-loader/model/item-data.ts';
import { type NpcData, toNPC } from 'src/domain/data-loader/model/npc-data.ts';

export type RoomData = {
    name: string;
    title: string;
    description: string;
    'short-description'?: string;
    connections?: ConnectionData[];
    items?: ItemData[];
    npcs?: string[];
};

export function toRoom(
    roomData: RoomData,
    globalItems: ItemData[],
    globalNpcs: NpcData[],
): Room {
    const room = new Room(
        roomData.name,
        roomData.title,
        roomData.description,
        roomData['short-description'],
    );

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
