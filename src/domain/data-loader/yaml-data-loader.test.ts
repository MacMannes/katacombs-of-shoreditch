import { beforeEach, describe, expect, it } from 'vitest';
import {
    GameRealm,
    isActionDialog,
    isBaseDialog,
    isChoiceDialog,
    isConditionDialog,
    NPC,
    YamlDataLoader,
} from '../index';
import path from 'node:path';
import { CountableItem } from '../model';
import { fail } from 'node:assert';
import { expectToBeDefined } from '../../utils/test';

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
            expect(rooms.find((room) => room.getName() === 'nowhere')).toBeDefined();
            expect(rooms.find((room) => room.getName() === 'start')).toBeDefined();
            expect(rooms.find((room) => room.getName() === 'building')).toBeDefined();
        });

        it('should load short descriptions of the rooms', async () => {
            const rooms = realm.rooms;
            expect(rooms.find((room) => room.getName() === 'start')?.getDescription('short')).toBe('room-start-short');
        });

        it('should add connections to  the rooms', async () => {
            const rooms = realm.rooms;
            const fromStartToBuilding = rooms.find((room) => room.getName() === 'start')?.findConnection('north');
            expect(fromStartToBuilding).toBeDefined();
            expect(fromStartToBuilding?.description).toBeDefined();
            expect(fromStartToBuilding?.matchesDirection('inside')).toBeTruthy();

            const fromBuildingToStart = rooms.find((room) => room.getName() === 'building')?.findConnection('south');
            expect(fromBuildingToStart).toBeDefined();
        });

        it('should add items to the rooms', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.getName() === 'building');
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
            const building = rooms.find((room) => room.getName() === 'building');
            expect(building).toBeDefined();

            const coin = building?.findItem('coin', true);
            expect(coin).toBeDefined();
            expect(coin?.isVisible()).toBeFalsy();
        });

        it('should handle immovable items as expected', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.getName() === 'building');
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
            const startRoom = rooms.find((room) => room.getName() === 'start');
            expect(startRoom).toBeDefined();

            const coins = startRoom?.findItem('coin', true);
            expect(coins).toBeDefined();
            expect(coins instanceof CountableItem).toBeTruthy();
            expect((coins as unknown as CountableItem).getCount()).toBe(2);
            expect(coins?.getDescription('room')).toContain('item-coin-room-few');
        });

        it('should override the `visible` property for the coins in the shop ', async () => {
            const rooms = realm.rooms;
            const shop = rooms.find((room) => room.getName() === 'shop');
            expect(shop).toBeDefined();

            const coins = shop?.findItem('coin');
            expect(coins).toBeDefined();
            expect(coins?.isVisible()).toBeTruthy();
        });

        it('should add states to the items', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.getName() === 'building');
            expect(building).toBeDefined();

            const lamp = building?.findItem('lamp');
            expect(lamp).toBeDefined();
            expect(lamp?.getCurrentState()).toBe('unlit');

            lamp?.setState('lit');
            expect(lamp?.getCurrentState()).toBe('lit');
        });

        it('should add triggers to the items', async () => {
            const rooms = realm.rooms;
            const building = rooms.find((room) => room.getName() === 'building');
            expect(building).toBeDefined();

            const casks = building?.findItem('casks', true);

            expect(casks).toBeDefined();
            expect(casks?.getTriggers()).toHaveLength(1);
            expect(casks?.getTriggers()?.[0]).toStrictEqual({
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
            const building = rooms.find((room) => room.getName() === 'building');
            expect(building).toBeDefined();

            const lamp = building?.findItem('lantern', true);
            expect(lamp).toBeDefined();
            const dropTrigger = lamp?.getTriggers('drop')?.at(0);

            expect(dropTrigger).toBeDefined();
            expect(dropTrigger?.verb).toBe('drop');
            expect(dropTrigger?.conditions).toBeUndefined();
        });

        it('should add conditions to the triggers for "drop cheese"', async () => {
            const rooms = realm.rooms;
            const start = rooms.find((room) => room.getName() === 'start');
            expect(start).toBeDefined();

            const cheese = start?.findItem('cheese', true);
            expect(cheese).toBeDefined();
            expect(cheese?.getTriggers()).toHaveLength(2);
            const dropTrigger = cheese?.getTriggers()?.[1];

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
            const building = rooms.find((room) => room.getName() === 'building');
            expect(building).toBeDefined();

            const hole = building?.findItem('hole', true);
            expect(hole).toBeDefined();
            expect(hole?.getTriggers()).toHaveLength(1);
            const lookTrigger = hole?.getTriggers()?.[0];

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
            const rooms = realm.rooms;
            const shop = rooms.find((room) => room.getName() === 'shop');
            expectToBeDefined(shop);

            const npcs = shop.getNpcs();
            expect(npcs).toHaveLength(1);
            shopkeeper = npcs[0];
        });

        function getDialog(id: string) {
            return shopkeeper.dialogs.find((dialog) => dialog.id === id);
        }

        it('should load the npcs', async () => {
            expect(shopkeeper.name).toBe('shopkeeper');
            expect(shopkeeper.greeting).toBe('npc-shopkeeper-welcome');
        });

        it('should add descriptions to the NPC', () => {
            expect(shopkeeper.description).toStrictEqual({
                room: 'shopkeeper-description-room',
                look: 'shopkeeper-description-look',
            });
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
                fail('Expected dialog to be a ChoiceDialog');
            }
        });

        it('should add text, response and next properties to the dialogs', () => {
            const startDialog = getDialog('buy-something');
            if (isBaseDialog(startDialog)) {
                expect(startDialog.text).toBe('I’ll take something.');
                expect(startDialog.response).toBe('npc-shopkeeper-what-will-it-be');
                expect(startDialog.next).toBe('what-will-it-be');
            } else {
                fail('Expected dialog to be a BaseDialog');
            }
        });

        it('should set exit to true on the "bye" dialog', () => {
            const startDialog = getDialog('bye');
            if (isBaseDialog(startDialog)) {
                expect(startDialog.exit).toBeTruthy();
            } else {
                fail('Expected dialog to be a BaseDialog');
            }
        });

        it('should set enabled to true on the "bye" dialog', () => {
            const startDialog = getDialog('bye');
            if (isBaseDialog(startDialog)) {
                expect(startDialog.enabled).toBeTruthy();
            } else {
                fail('Expected dialog to be a BaseDialog');
            }
        });

        it('should set enabled and exit to false on the "are-you-serious" dialog', () => {
            const areYouSeriousDialog = getDialog('are-you-serious');
            if (isActionDialog(areYouSeriousDialog)) {
                expect(areYouSeriousDialog.exit).toBeFalsy();
                expect(areYouSeriousDialog.enabled).toBeFalsy();
            } else {
                fail('Expected dialog to be a ActionDialog');
            }
        });

        it('should add actions to the "buy-lighter-success" dialog', () => {
            const buyLighterSuccess = getDialog('buy-lighter-success');
            if (isActionDialog(buyLighterSuccess)) {
                expect(buyLighterSuccess.actions).toHaveLength(5);
                expect(buyLighterSuccess.actions[0]).toStrictEqual({
                    command: 'disableDialog',
                    argument: 'shopkeeper',
                    parameter: 'ask-about-lighter',
                    responses: undefined,
                });
                expect(buyLighterSuccess.actions[1]).toStrictEqual({
                    command: 'disableDialog',
                    argument: 'shopkeeper',
                    parameter: 'choose-lighter',
                    responses: undefined,
                });
            } else {
                fail('Expected dialog to be a ActionDialog');
            }
        });

        it('should post-condition to the "pay-for-lighter" dialog', () => {
            const payForLighterDialog = getDialog('pay-for-lighter');
            if (isConditionDialog(payForLighterDialog)) {
                expect(payForLighterDialog.postConditions).toHaveLength(1);
                expect(payForLighterDialog.postConditions?.at(0)).toStrictEqual({
                    type: 'hasItem',
                    key: 'coin',
                    value: '10',
                });
                expect(payForLighterDialog.success).toBe('buy-lighter-success');
                expect(payForLighterDialog.failure).toBe('buy-lighter-failure');
            } else {
                fail('Expected dialog to be a ConditionDialog');
            }
        });

        it('should pre-condition to the "ask-about-treasure-island" dialog', () => {
            const askAboutTreasureIslandDialog = getDialog('ask-about-treasure-island');
            if (isConditionDialog(askAboutTreasureIslandDialog)) {
                expect(askAboutTreasureIslandDialog.preConditions).toHaveLength(1);
                expect(askAboutTreasureIslandDialog.preConditions?.at(0)).toStrictEqual({
                    type: 'hasItem',
                    key: 'book',
                    value: '',
                });
                expect(askAboutTreasureIslandDialog.success).toBeUndefined();
                expect(askAboutTreasureIslandDialog.failure).toBeUndefined();
            } else {
                fail('Expected dialog to be a ConditionDialog');
            }
        });
    });
});
