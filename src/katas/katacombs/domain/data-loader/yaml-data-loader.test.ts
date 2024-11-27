import { describe, expect, it } from 'vitest';
import { YamlDataLoader } from '@katas/katacombs/domain';
import path from 'node:path';

describe('YamlDataLoader', () => {
    const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
    const loader = new YamlDataLoader();

    it('should load the rooms', async () => {
        const result = await loader.load(gameDataPath);
        expect(result.length).toBeGreaterThan(2);
        expect(result.find((room) => room.name === 'nowhere')).toBeDefined();
        expect(result.find((room) => room.name === 'start')).toBeDefined();
        expect(result.find((room) => room.name === 'building')).toBeDefined();
    });

    it('should add connections to  the rooms', async () => {
        const result = await loader.load(gameDataPath);
        const fromStartToBuilding = result.find((room) => room.name === 'start')?.findConnection('north');
        expect(fromStartToBuilding).toBeDefined();
        expect(fromStartToBuilding?.description).toBeDefined();
        expect(fromStartToBuilding?.matchesDirection('inside')).toBeTruthy();

        const fromBuildingToStart = result.find((room) => room.name === 'building')?.findConnection('south');
        expect(fromBuildingToStart).toBeDefined();
    });

    it('should add items to the rooms', async () => {
        const result = await loader.load(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const lamp = building?.findItem('lamp');
        expect(lamp).toBeDefined();
        expect(lamp?.getDescription('room')).toContain('lantern');
        expect(lamp?.getDescription('inventory')).toContain('lantern');
        expect(lamp?.getDescription('look')).toContain('polished');
    });

    it('should add invisible items to the rooms', async () => {
        const result = await loader.load(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const coin = building?.findItem('coin', true);
        expect(coin).toBeDefined();
        expect(coin?.isVisible()).toBeFalsy();
    });

    it('should add immovable items to the rooms', async () => {
        const result = await loader.load(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const desk = building?.findItem('desk', true);
        expect(desk).toBeDefined();
        expect(desk?.immovable).toBeTruthy();

        const coin = building?.findItem('coin', true);
        expect(coin).toBeDefined();
        expect(coin?.immovable).toBeFalsy();
    });

    it('should add triggers to the items', async () => {
        const result = await loader.load(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const casks = building?.findItem('casks', true);

        expect(casks).toBeDefined();
        expect(casks?.triggers).toHaveLength(1);
        expect(casks?.triggers?.[0]).toStrictEqual({
            verb: 'look',
            actions: [
                {
                    command: 'reveal',
                    argument: 'coin',
                    parameter: undefined,
                    responses: {
                        success:
                            'You peer closely at the casks. Amidst the dust and cobwebs,  a glint catches your eye — a single coin nestled against the wood.  A hidden treasure or someone’s forgotten tip?',
                        failure:
                            'You take another look at the casks, hoping for a second coin.  All you find is disappointment.',
                    },
                },
            ],
        });
    });

    it('should not add conditions to the triggers for "drop lamp"', async () => {
        const result = await loader.load(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const lamp = building?.findItem('lantern', true);
        expect(lamp).toBeDefined();
        const dropTrigger = lamp?.triggers?.find((trigger) => trigger.verb === 'drop');

        expect(dropTrigger).toBeDefined();
        expect(dropTrigger?.verb).toBe('drop');
        expect(dropTrigger?.conditions).toBeUndefined();
    });

    it('should add conditions to the triggers for "drop cheese"', async () => {
        const result = await loader.load(gameDataPath);
        const start = result.find((room) => room.name === 'start');
        expect(start).toBeDefined();

        const cheese = start?.findItem('cheese', true);
        expect(cheese).toBeDefined();
        expect(cheese?.triggers).toHaveLength(2);
        const dropTrigger = cheese?.triggers?.[1];

        expect(dropTrigger).toBeDefined();
        expect(dropTrigger?.verb).toBe('drop');
        expect(dropTrigger?.conditions).toHaveLength(0);
    });

    it('should add states to the items', async () => {
        const result = await loader.load(gameDataPath);
        const building = result.find((room) => room.name === 'building');
        expect(building).toBeDefined();

        const lamp = building?.findItem('lamp');
        expect(lamp).toBeDefined();
        expect(lamp?.getCurrentState()).toBe('unlit');

        lamp?.setState('lit');
        expect(lamp?.getCurrentState()).toBe('lit');
    });
});
