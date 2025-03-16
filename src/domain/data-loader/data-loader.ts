import type { GameRealm } from 'src/domain/model/game/game-realm.ts';

export type DataLoader = {
    load(filePath: string): Promise<GameRealm>;
};
