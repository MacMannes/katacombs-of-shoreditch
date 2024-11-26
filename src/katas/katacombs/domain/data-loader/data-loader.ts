import { Room } from '@katas/katacombs/domain';

export interface DataLoader {
    load(filePath: string): Promise<Room[]>;
}
