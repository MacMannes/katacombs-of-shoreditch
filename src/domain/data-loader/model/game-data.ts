import { ItemData, NpcData, RoomData, TextData } from 'src/domain';

export type GameData = {
    rooms: RoomData[];
    items: ItemData[];
    texts: TextData;
    npcs: NpcData[];
};
