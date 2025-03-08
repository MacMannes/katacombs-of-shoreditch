import { DataLoader, GameData, GameRealm, toRoom } from 'src/domain';
import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';

export class YamlDataLoader implements DataLoader {
    public async load(filePath: string): Promise<GameRealm> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        const rooms = gameData.rooms.map((roomData) => toRoom(roomData, gameData.items, gameData.npcs));
        const texts = gameData.texts;
        return { rooms, texts };
    }
}
