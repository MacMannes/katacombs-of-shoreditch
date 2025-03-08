import { ItemData, NpcData, RoomData, TextData } from '../../index';

export type GameData = {
    rooms: RoomData[];
    items: ItemData[];
    texts: TextData;
    npcs: NpcData[];
};
