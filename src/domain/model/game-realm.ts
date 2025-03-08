import { Room } from '../index';

export type GameRealm = {
    rooms: Room[];
    texts: Record<string, string>;
};
