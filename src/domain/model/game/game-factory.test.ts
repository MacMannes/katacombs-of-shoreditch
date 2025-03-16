import { YamlDataLoader } from 'src/domain/data-loader/yaml-data-loader.ts';
import { createMockedObject } from 'src/utils/test/create-mocked-object.ts';
import { describe, expect, it } from 'vitest';
import { Room } from 'src/domain/model/room/room.ts';
import { GameFactory } from 'src/domain/model/game/game-factory.ts';
import type { GameRealm } from 'src/domain/model/game/game-realm.ts';

function createRooms(): Room[] {
    return [
        new Room('start', 'Beginning', 'You are at the beginning of the game.'),
    ];
}

describe('GameFactory', () => {
    const dataLoader = createMockedObject(YamlDataLoader);
    const realm: GameRealm = { rooms: createRooms(), texts: {} };
    dataLoader.load.mockResolvedValue(realm);

    it('should create a new game with rooms from the specified path', async () => {
        const gameFactory = new GameFactory(dataLoader);
        const game = await gameFactory.createGame('./game-data.yaml');

        expect(game).toBeDefined();
        expect(dataLoader.load).toHaveBeenCalledWith('./game-data.yaml');
    });
});
