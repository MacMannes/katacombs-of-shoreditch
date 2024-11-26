import { describe, expect, it } from 'vitest';
import { createMockedObject } from '@utils/test';
import { GameFactory, Room, YamlDataLoader } from '@katas/katacombs/domain';

function createRooms(): Room[] {
    return [new Room('start', 'Beginning', 'You are at the beginning of the game.')];
}

describe('GameFactory', () => {
    const dataLoader = createMockedObject(YamlDataLoader);
    dataLoader.load.mockResolvedValue(createRooms());

    it('should create a new game with rooms from the specified path', async () => {
        const gameFactory = new GameFactory(dataLoader);
        const game = await gameFactory.createGame('./game-data.yaml');

        expect(game).toBeDefined();
        expect(dataLoader.load).toHaveBeenCalledWith('./game-data.yaml');
    });
});
