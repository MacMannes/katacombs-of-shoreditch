import { GameRealm } from '@katas/katacombs/domain';

export type DataLoader = {
    load(filePath: string): Promise<GameRealm>;
};
