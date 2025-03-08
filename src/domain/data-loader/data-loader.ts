import { GameRealm } from '../index';

export type DataLoader = {
    load(filePath: string): Promise<GameRealm>;
};
