import type { Room } from 'src/domain/model/room/room.ts';

export type GameRealm = {
    rooms: Room[];
    texts: Record<string, string>;
};
