import { Room } from '@katas/katacombs/domain';

export type GameRealm = {
    rooms: Room[];
    texts: Record<string, string>;
};
