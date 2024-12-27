import { assert, beforeEach, describe, expect, it } from 'vitest';
import { ChoiceDialog, GameRealm, isBaseDialog, isChoiceDialog, NPC, YamlDataLoader } from '@katas/katacombs/domain';
import path from 'node:path';
import { CountableItem } from '@katas/katacombs/domain/model/countable-item';
import { fail } from 'node:assert';

describe('YamlDataLoader', () => {
    const gameDataPath = path.resolve(__dirname, '../../resources/test-game-data.yaml'); // Converts to absolute path
    const loader = new YamlDataLoader();
    let realm: GameRealm;

    beforeEach(async () => {
        realm = await loader.load(gameDataPath);
    });

    describe('Rooms', () => {
        it('should load the rooms', async () => {
            const rooms = realm.rooms;
            expect(rooms.length).toBeGreaterThan(2);
            expect(rooms.find((room) => room.name === 'nowhere')).toBeDefined();
            expect(rooms.find((room) => room.name === 'start')).toBeDefined();
            expect(rooms.find((room) => room.name === 'building')).toBeDefined();
        });

        it('should load short descriptions of the rooms', async () => {
            const rooms = realm.rooms;
            expect(rooms.find((room) => room.name === 'nowhere')?.shortDescription).toBeUndefined();
            expect(rooms.find((room) => room.name === 'start')?.shortDescription).toBeDefined();
        });

        it('should add connections to  the rooms', async () => {
            const rooms = realm.rooms;
            const fromStartToBuilding = rooms.find((room) => room.name === 'start')?.findConnection('north');
            expect(fromStartToBuilding).toBeDefined();
            expect(fromStartToBuilding?.description).toBeDefined();
            expect(fromStartToBuilding?.matchesDirection('inside')).toBeTruthy();

            const fromBuildingToStart = rooms.find((room) => room.name === 'building')?.findConnection('south');
            expect(fromBuildingToStart).toBeDefined();
        });

        it('should add items to the rooms', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const lamp = building?.findItem('lamp');
            expect(lamp).toBeDefined();
            expect(lamp?.getDescription('room')).toContain('item-lantern-room');
            expect(lamp?.getDescription('inventory')).toContain('item-lantern-inventory');
            expect(lamp?.getDescription('look')).toContain('item-lantern-look');
        });
    });

    describe('Items', () => {
        it('should handle invisible items as expected', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const coin = building?.findItem('coin', true);
            expect(coin).toBeDefined();
            expect(coin?.isVisible()).toBeFalsy();
        });

        it('should handle immovable items as expected', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const desk = building?.findItem('desk', true);
            expect(desk).toBeDefined();
            expect(desk?.immovable).toBeTruthy();

            const coin = building?.findItem('coin', true);
            expect(coin).toBeDefined();
            expect(coin?.immovable).toBeFalsy();
        });

        it('should handle Countable items as expected', async () => {
            const rooms = realm.rooms;
            const startRoom = rooms.find((room) => room.name === 'start');
            expect(startRoom).toBeDefined();

            const coins = startRoom?.findItem('coin', true);
            expect(coins).toBeDefined();
            expect(coins instanceof CountableItem).toBeTruthy();
            expect((coins as unknown as CountableItem).getCount()).toBe(2);
            expect(coins?.getDescription('room')).toContain('item-coin-room-few');
        });

        it('should add states to the items', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const lamp = building?.findItem('lamp');
            expect(lamp).toBeDefined();
            expect(lamp?.getCurrentState()).toBe('unlit');

            lamp?.setState('lit');
            expect(lamp?.getCurrentState()).toBe('lit');
        });

        it('should add triggers to the items', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const casks = building?.findItem('casks', true);

            expect(casks).toBeDefined();
            expect(casks?.triggers).toHaveLength(1);
            expect(casks?.triggers?.[0]).toStrictEqual({
                verb: 'look',
                conditions: undefined,
                actions: [
                    {
                        command: 'reveal',
                        argument: 'coin',
                        parameter: undefined,
                        responses: {
                            success: 'look-casks-success',
                            failure: 'look-casks-failure',
                        },
                    },
                ],
            });
        });

        it('should not add conditions to the triggers for "drop lamp"', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const lamp = building?.findItem('lantern', true);
            expect(lamp).toBeDefined();
            const dropTrigger = lamp?.triggers?.find((trigger) => trigger.verb === 'drop');

            expect(dropTrigger).toBeDefined();
            expect(dropTrigger?.verb).toBe('drop');
            expect(dropTrigger?.conditions).toBeUndefined();
        });

        it('should add conditions to the triggers for "drop cheese"', async () => {
            const rooms = realm.rooms;
            const start = rooms.find((room) => room.name === 'start');
            expect(start).toBeDefined();

            const cheese = start?.findItem('cheese', true);
            expect(cheese).toBeDefined();
            expect(cheese?.triggers).toHaveLength(2);
            const dropTrigger = cheese?.triggers?.[1];

            expect(dropTrigger).toBeDefined();
            expect(dropTrigger?.verb).toBe('drop');
            expect(dropTrigger?.conditions).toHaveLength(1);
            expect(dropTrigger?.conditions?.[0]).toStrictEqual({
                type: 'location',
                key: 'currentLocation',
                value: 'building',
            });
        });

        it('should add conditions to the triggers for "look hole"', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.name === 'building');
            expect(building).toBeDefined();

            const hole = building?.findItem('hole', true);
            expect(hole).toBeDefined();
            expect(hole?.triggers).toHaveLength(1);
            const lookTrigger = hole?.triggers?.[0];

            expect(lookTrigger).toBeDefined();
            expect(lookTrigger?.verb).toBe('look');
            expect(lookTrigger?.conditions).toHaveLength(1);
            expect(lookTrigger?.conditions?.[0]).toStrictEqual({
                type: 'hasState',
                key: 'hole',
                value: 'unguarded',
            });
        });
    });

    describe('NPCs', () => {
        let shopkeeper: NPC;

        beforeEach(() => {
            const npcs = realm.npcs;
            expect(Object.keys(npcs)).toHaveLength(1);
            shopkeeper = npcs[0];
        });

        function getDialog(id: string) {
            return shopkeeper.dialogs.find((dialog) => dialog.id === id);
        }

        it('should load the npcs', async () => {
            expect(shopkeeper.name).toBe('shopkeeper');
            expect(shopkeeper.greeting).toBe('npc-shopkeeper-welcome');
        });

        it('should add dialogs to the NPC', () => {
            expect(shopkeeper.greeting).toBe('npc-shopkeeper-welcome');
            expect(shopkeeper.dialogs.length).toBeGreaterThan(10);
        });

        it('should add choices to the start dialog', () => {
            const startDialog = getDialog('start');
            if (isChoiceDialog(startDialog)) {
                expect(startDialog.choices.length).toBeGreaterThanOrEqual(6);
                expect(startDialog.exit).toBeFalsy();
            } else {
                fail('Expected startDialog to be a ChoiceDialog');
            }
        });

        it('should add text, response and next properties to the dialogs', () => {
            const startDialog = getDialog('buy-something');
            if (isBaseDialog(startDialog)) {
                expect(startDialog.text).toBe('I’ll take something.');
                expect(startDialog.response).toBe('npc-shopkeeper-what-will-it-be');
                expect(startDialog.next).toBe('what-will-it-be');
            } else {
                fail('Expected startDialog to be a BaseDialog');
            }
        });

        it('should set exit to true on the "bye" dialog', () => {
            const startDialog = getDialog('bye');
            if (isBaseDialog(startDialog)) {
                expect(startDialog.exit).toBeTruthy();
            } else {
                fail('Expected startDialog to be a BaseDialog');
            }
        });

        it('should set enabled to true on the "bye" dialog', () => {
            const startDialog = getDialog('bye');
            if (isBaseDialog(startDialog)) {
                expect(startDialog.enabled).toBeTruthy();
            } else {
                fail('Expected startDialog to be a BaseDialog');
            }
        });

        it('should set enabled and exit to false on the "are-you-serious" dialog', () => {
            const areYouSeriousDialog = getDialog('are-you-serious');
            if (isBaseDialog(areYouSeriousDialog)) {
                expect(areYouSeriousDialog.exit).toBeFalsy();
                expect(areYouSeriousDialog.enabled).toBeFalsy();
            } else {
                fail('Expected startDialog to be a BaseDialog');
            }
        });

        it('should add actions to the "buy-lighter-success" dialog', () => {
            const areYouSeriousDialog = getDialog('buy-lighter-success');
            if (isBaseDialog(areYouSeriousDialog)) {
                expect(areYouSeriousDialog.exit).toBeFalsy();
                expect(areYouSeriousDialog.enabled).toBeFalsy();
            } else {
                fail('Expected startDialog to be a BaseDialog');
            }
        });

        //TODO: Test `actions`
        //TODO: Test `post-conditions`: success / faiure
        //TODO: Test `post-conditions`: has-item + count
        //TODO: Test `pre-conditions`
    });
});
