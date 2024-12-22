import { ItemData, RoomData, TextData } from '@katas/katacombs/domain';

export type GameData = {
    rooms: RoomData[];
    items: ItemData[];
    texts: TextData;
};
