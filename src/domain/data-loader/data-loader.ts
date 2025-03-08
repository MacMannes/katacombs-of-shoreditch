import { GameRealm } from 'src/domain';

export type DataLoader = {
    load(filePath: string): Promise<GameRealm>;
};
