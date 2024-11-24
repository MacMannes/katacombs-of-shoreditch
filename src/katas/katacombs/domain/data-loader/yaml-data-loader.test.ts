import { describe, expect, it } from 'vitest';
import { YamlDataLoader } from '@katas/katacombs/domain';
import path from 'node:path';

describe('YamlDataLoader', () => {
    const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
    const loader = new YamlDataLoader();

    it('should load the rooms', async () => {
        const result = await loader.loadGameDate(gameDataPath);
        expect(result.length).toBeGreaterThan(2);
        expect(result.find((room) => room.name === 'nowhere')).toBeDefined();
        expect(result.find((room) => room.name === 'start')).toBeDefined();
        expect(result.find((room) => room.name === 'building')).toBeDefined();
    });
});
