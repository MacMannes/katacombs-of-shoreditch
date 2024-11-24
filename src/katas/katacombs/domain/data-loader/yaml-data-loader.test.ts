import { describe, expect, it } from 'vitest';
import { YamlDataLoader } from '@katas/katacombs/domain';
import path from 'node:path';

describe('YamlDataLoader', () => {
    const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
    const loader = new YamlDataLoader();

    it('should load the rooms', async () => {
        const result = await loader.loadGameFromFile(gameDataPath);
        expect(result.length).toBeGreaterThan(2);
        expect(result.find((room) => room.name === 'nowhere')).toBeDefined();
        expect(result.find((room) => room.name === 'start')).toBeDefined();
        expect(result.find((room) => room.name === 'building')).toBeDefined();
    });

    it('should add connections to  the rooms', async () => {
        const result = await loader.loadGameFromFile(gameDataPath);
        const fromStartToBuilding = result.find((room) => room.name === 'start')?.findConnection('north');
        expect(fromStartToBuilding).toBeDefined();
        expect(fromStartToBuilding?.description).toBeDefined();
        expect(fromStartToBuilding?.matchesDirection('inside')).toBeTruthy();

        const fromuildingToStart = result.find((room) => room.name === 'building')?.findConnection('south');
        expect(fromuildingToStart).toBeDefined();
    });

    it('should add items to the rooms', async () => {
        const result = await loader.loadGameFromFile(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const lamp = building?.findItem('lamp');
        expect(lamp).toBeDefined();
        expect(lamp?.getDescription('room')).toContain('lantern');
        expect(lamp?.getDescription('inventory')).toContain('lantern');
        expect(lamp?.getDescription('look')).toContain('polished');
    });

    it('should add invisible items to the rooms', async () => {
        const result = await loader.loadGameFromFile(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const coin = building?.findItem('coin', true);
        expect(coin).toBeDefined();
        expect(coin?.isVisible()).toBeFalsy();
    });

    it('should add immovable items to the rooms', async () => {
        const result = await loader.loadGameFromFile(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const desk = building?.findItem('desk', true);
        expect(desk).toBeDefined();
        expect(desk?.immovable).toBeTruthy();

        const coin = building?.findItem('coin', true);
        expect(coin).toBeDefined();
        expect(coin?.immovable).toBeFalsy();
    });
});
