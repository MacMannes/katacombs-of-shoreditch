import { RoomData } from '@katas/katacombs/domain';

export type GameData = {
    rooms: RoomData[];
    texts: Record<string, string>;
};
