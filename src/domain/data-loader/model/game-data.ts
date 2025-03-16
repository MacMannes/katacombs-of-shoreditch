import type { ItemData } from 'src/domain/data-loader/model/item-data.ts';
import type { NpcData } from 'src/domain/data-loader/model/npc-data.ts';
import type { RoomData } from 'src/domain/data-loader/model/room-data.ts';
import type { TextData } from 'src/domain/data-loader/model/text-data.ts';

export type GameData = {
    rooms: RoomData[];
    items: ItemData[];
    texts: TextData;
    npcs: NpcData[];
};
