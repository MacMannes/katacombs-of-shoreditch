import { ItemData, NpcData, RoomData, TextData } from '@katas/katacombs/domain';

export type GameData = {
    rooms: RoomData[];
    items: ItemData[];
    texts: TextData;
    npcs: NpcData[];
};
