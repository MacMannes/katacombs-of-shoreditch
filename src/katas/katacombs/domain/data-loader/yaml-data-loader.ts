import { GameData, Room, toRoom } from '@katas/katacombs/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';

export class YamlDataLoader {
    public async loadGameFromFile(filePath: string): Promise<Room[]> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        return gameData.rooms.map((roomData) => toRoom(roomData));
    }
}
