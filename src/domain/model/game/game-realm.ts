import { Room } from 'src/domain';

export type GameRealm = {
    rooms: Room[];
    texts: Record<string, string>;
};
