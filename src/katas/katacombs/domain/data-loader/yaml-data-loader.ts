import { Room } from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';

export class YamlDataLoader {
    public async loadGameDate(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        return [];
    }
}
