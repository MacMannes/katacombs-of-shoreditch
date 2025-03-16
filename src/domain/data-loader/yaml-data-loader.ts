import { readFile } from 'node:fs/promises';
import { load } from 'js-yaml';
import type { DataLoader } from 'src/domain/data-loader/data-loader.ts';
import type { GameRealm } from 'src/domain/model/game/game-realm.ts';
import type { GameData } from 'src/domain/data-loader/model/game-data.ts';
import { toRoom } from 'src/domain/data-loader/model/room-data.ts';

export class YamlDataLoader implements DataLoader {
    public async load(filePath: string): Promise<GameRealm> {
        const data = await readFile(filePath, 'utf-8');
        const gameData: GameData = load(data) as GameData;

        const rooms = gameData.rooms.map((roomData) =>
            toRoom(roomData, gameData.items, gameData.npcs),
        );
        const texts = gameData.texts;
        return { rooms, texts };
    }
}
