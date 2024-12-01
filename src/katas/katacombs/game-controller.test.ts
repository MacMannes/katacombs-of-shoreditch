import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestRooms, Game, ItemRepository, RoomRepository, TextWithAudioFiles } from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';
import { NoOpUserInterface } from '@katas/katacombs/ui';
import { GameController } from '@katas/katacombs';

describe('GameController', async () => {
    const ui = createMockedObject(NoOpUserInterface);
    let controller: GameController;

    async function createGameController() {
        const testRooms = await createTestRooms();
        const roomRepository = new RoomRepository(testRooms);
        const itemRepository = new ItemRepository();
        const game = new Game(roomRepository, itemRepository);
        controller = new GameController(game, ui);
    }

    beforeEach(async () => {
        await createGameController();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Starting the game', async () => {
        beforeEach(async () => {
            ui.getUserInput.mockResolvedValue('quit');
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should print the welcome message', async () => {
            await controller.startGame();
            expect(ui.displayWelcomeMessage).toHaveBeenCalledTimes(1);
        });

        it('should print the title and description of the starting room', async () => {
            await controller.startGame();
            expect(ui.displayRoom).toHaveBeenCalledTimes(1);
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should continue to ask for user input until the user says "quit"', async () => {
            ui.getUserInput.mockResolvedValueOnce('look');
            ui.getUserInput.mockResolvedValueOnce('go north');
            ui.getUserInput.mockResolvedValueOnce('take lamp');

            await controller.startGame();
            expect(ui.displayRoom).toHaveBeenCalledTimes(3);
            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'OK.' }));
            expect(ui.displayMessage).toHaveBeenCalledWith(new TextWithAudioFiles('Bye!', ['bye']));
        });
    });

    describe('Quitting the game', async () => {
        it('should say "Bye!" and pass the audioKey "bye"', async () => {
            await controller.processCommand('quit');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('Bye!', ['bye']));
        });
    });

    describe('Processing commands', async () => {
        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "What?" when the command could not be interpreted', async () => {
            await controller.processCommand('print', 'invoice');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
        });

        it('should say "What?" when an invalid commands with only a verb was given', async () => {
            await controller.processCommand('relax');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
        });

        it('should not say "What?" when command "look" was given without a target', async () => {
            await controller.processCommand('look');
            expect(ui.displayMessage).not.toBeCalledWith(new TextWithAudioFiles('What?'));
        });

        it('should display the current room when command "look" was given without a target', async () => {
            await controller.processCommand('look');
            expect(ui.displayRoom).toHaveBeenCalledTimes(1);
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should process look commands with a target', async () => {
            await controller.processCommand('look', 'north');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should say "What?" when the go command was given without a direction', async () => {
            await controller.processCommand('go');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
        });

        it('should process the go command when a direction was given', async () => {
            await controller.processCommand('go', 'building');
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
        });

        it('should process the take command', async () => {
            await controller.processCommand('take', 'watch');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles("Can't find watch here."));
        });

        it('should say "What?" when the take command was given without a target', async () => {
            await controller.processCommand('take');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
        });

        it('should process the drop command', async () => {
            await controller.processCommand('drop', 'watch');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles("You aren't carrying it!"));
        });

        it('should say "What?" when the drop command was given without a target', async () => {
            await controller.processCommand('drop');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
        });

        it('should process the inventory command', async () => {
            await controller.processCommand('inventory');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('carrying') }),
            );
        });

        it('should say "What?" when the speak command is used by the user', async () => {
            await controller.processCommand('speak', 'Hello World!');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
            expect(ui.displayMessage).toBeCalledTimes(1);
        });
    });

    describe('Traveling', async () => {
        describe('to an ordinal direction', async () => {
            it('should print the new room when the direction is valid', async () => {
                await controller.processCommand('go', 'north');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when direction is invalid', async () => {
                await controller.processCommand('go', 'west');
                expect(ui.displayMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ text: expect.stringContaining('no way') }),
                );
            });

            it('should print the current room when the direction is invalid', async () => {
                await controller.processCommand('go', 'west');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
            });
        });

        describe('using synonyms of the connection', async () => {
            it('should print the new room when traveling to a synonym of the connection was successful', async () => {
                await controller.processCommand('go', 'building');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when synonym could not be found', async () => {
                await controller.processCommand('go', 'left');
                expect(ui.displayMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ text: expect.stringContaining('no way') }),
                );
            });
        });
    });

    describe('Looking around', async () => {
        it('should show the description of the room when looking in no specific direction', async () => {
            await controller.processCommand('look');

            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should show the description when looking in a specific direction with a connection', async () => {
            await controller.processCommand('look', 'north');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show the description when looking at one of the synonyms of a connection', async () => {
            await controller.processCommand('look', 'building');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show something like "Nothing interesting" when looking in a specific direction with NO connection', async () => {
            await controller.processCommand('look', 'west');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Nothing interesting') }),
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show something like "Nothing interesting" when looking at a connection with no description', async () => {
            await controller.processCommand('go', 'north');
            vi.resetAllMocks();

            await controller.processCommand('look', 'outside');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Nothing interesting') }),
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });
    });

    describe('Looking at items', async () => {
        it('should show the description of the item when found', async () => {
            await controller.processCommand('go', 'north');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            await controller.processCommand('look', 'note');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The note is crumpled') }),
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show the description of the item in the room when when looking at it using a synonym', async () => {
            await controller.processCommand('go', 'north');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            await controller.processCommand('look', 'lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('It’s so polished you can see your' + ' reflection'),
                }),
            );
        });

        it('should show the description of the item in the inventory when when looking at it using a synonym', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'lantern');
            vi.resetAllMocks();

            await controller.processCommand('look', 'lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('It’s so polished you can see your reflection'),
                }),
            );
        });

        it('should show "I see no ... here" when looking at something that is not here', async () => {
            await controller.processCommand('look', 'note');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'I see no note here.' }));
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show "I see no ... here" when looking at something that is not visible', async () => {
            await controller.processCommand('go', 'north');
            vi.resetAllMocks();

            await controller.processCommand('look', 'key');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'I see no key here.' }));
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });
    });

    describe('Looking at items with trigger conditions', async () => {
        it('should tell the rat is guarding the hole when looking at the hole and the rat is still there', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('look', 'hole');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The rat blocks the hole') }),
            );
            expect(ui.displayMessage).not.toHaveBeenLastCalledWith(expect.stringContaining(' The rat blocks the hole'));
        });

        it('should tell a key is found when looking at the hole and the rat is gone', async () => {
            await controller.processCommand('take', 'cheese');
            await controller.processCommand('go', 'north');
            await controller.processCommand('drop', 'cheese');
            await controller.processCommand('look', 'hole');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('tiny key') }),
            );
        });

        it('should set the hole state to "examined" after looking at it and the state was "unguarded"', async () => {
            await controller.processCommand('take', 'cheese');
            await controller.processCommand('go', 'north');
            await controller.processCommand('drop', 'cheese');

            const hole = controller.getCurrentRoom().findItem('hole');
            expect(hole?.getCurrentState()).toBe('unguarded');

            await controller.processCommand('look', 'hole');
            expect(hole?.getCurrentState()).toBe('examined');
        });
    });

    describe('Taking items', async () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "OK." when the item exists in the room', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.'));
        });

        it('should say something like can not find ..." when the item can not be found in the room', async () => {
            await controller.processCommand('take', 'note');

            expect(ui.displayMessage).toBeCalledWith(expect.objectContaining({ text: "Can't find note here." }));
        });

        it('should say something like can not find ..." when the item in the room is invisible', async () => {
            await controller.processCommand('go', 'north');
            vi.resetAllMocks();

            await controller.processCommand('take', 'coin');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles("Can't find coin here."));
        });

        it('should move the item from the room to the inventory when it exists in the room', async () => {
            await controller.processCommand('go', 'north');
            expect(controller.getCurrentRoom().findItem('note')).toBeDefined();
            await controller.processCommand('take', 'note');

            expect(controller.getCurrentRoom().findItem('note')).toBeUndefined();
            expect(controller.getInventory().find((item) => item.matches('note'))).toBeDefined();
        });

        it('should say "OK." when taking an item using a synonym', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'lamp');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.'));
        });

        it('should not allow immovable objects to be taken', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'desk');

            const items = controller.getInventory().map((item) => item.name);
            expect(items).not.toContain('desk');
        });

        it('should say "You can`t be serious!" when trying to take an immovable object', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'desk');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles("You can't be serious!"));
        });
    });

    describe('Dropping items', async () => {
        it('should move the item from inventory to the room when the user possesses the item', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'note');
            await controller.processCommand('go', 'south');
            await controller.processCommand('drop', 'note');

            expect(controller.getCurrentRoom().findItem('note')).toBeDefined();
            expect(controller.getInventory().find((item) => item.matches('note'))).toBeUndefined();
        });

        it('should say "OK" when the item is dropped', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'note');
            await controller.processCommand('go', 'south');
            vi.resetAllMocks();

            await controller.processCommand('drop', 'note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.'));
        });

        it('should NOT say "OK" when an item is dropped by a trigger action', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'lamp');
            await controller.processCommand('go', 'south');
            vi.resetAllMocks();

            await controller.processCommand('drop', 'lamp');

            expect(ui.displayMessage).not.toBeCalledWith('OK.');
        });

        it('should say something like "You are not carrying it!" when the user does not possess the item', async () => {
            await controller.processCommand('drop', 'note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles("You aren't carrying it!"));
        });

        it('should say "OK." when dropping an item using a synonym', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'note');

            vi.resetAllMocks();
            await controller.processCommand('drop', 'memo');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.'));
        });
    });

    describe('Dropping items with trigger conditions', async () => {
        it('should say "OK." when dropping cheese in start room, because trigger conditions are not met', async () => {
            await controller.processCommand('take', 'cheese');

            vi.resetAllMocks();
            await controller.processCommand('drop', 'cheese');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.'));
        });

        it('should not say "OK." when dropping cheese in building, because trigger conditions are met', async () => {
            await controller.processCommand('take', 'cheese');
            await controller.processCommand('go', 'north');

            vi.resetAllMocks();
            await controller.processCommand('drop', 'cheese');

            expect(ui.displayMessage).not.toBeCalledWith('OK.');
        });

        it('should hide the rat and the cheese when dropping cheese in building', async () => {
            await controller.processCommand('take', 'cheese');
            await controller.processCommand('go', 'north');

            vi.resetAllMocks();
            await controller.processCommand('drop', 'cheese');

            const rat = controller.getCurrentRoom().findItem('rat', true);
            expect(rat?.isVisible()).toBeFalsy();
            const cheese = controller.getCurrentRoom().findItem('cheese', true);
            expect(cheese?.isVisible()).toBeFalsy();
        });
    });

    describe('Changing the state of items', async () => {
        beforeEach(async () => {
            createGameController();
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'lantern');
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should show the initial state of the lamp', async () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('should set the lamp to lit with the command "light lamp"', async () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            await controller.processCommand('light', 'lamp');

            expect(lamp?.getCurrentState()).toBe('lit');
        });

        it('should not say "What?" after giving the command "light lamp"', async () => {
            await controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).not.toBeCalledWith('What?');
        });

        it('should say the success response after giving the command "light lamp"', async () => {
            await controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('bursts into a steady flame') }),
            );
        });

        it('should say the failure response after giving the command "light lamp" twice', async () => {
            await controller.processCommand('light', 'lamp');
            vi.resetAllMocks();

            await controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('overachieve') }),
            );
        });

        it('should say the success response after giving the command "distinguish lamp"', async () => {
            await controller.processCommand('light', 'lamp');
            vi.resetAllMocks();

            await controller.processCommand('extinguish', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('you extinguish the lamp') }),
            );
        });

        it('should say the failure response after giving the command "distinguish lamp"', async () => {
            await controller.processCommand('extinguish', 'lamp');
            vi.resetAllMocks();

            await controller.processCommand('extinguish', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('An epic battle') }),
            );
        });

        it('should set the lamp to lit with the command "extinguish lamp"', async () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            await controller.processCommand('light', 'lamp');
            expect(lamp?.getCurrentState()).toBe('lit');

            await controller.processCommand('extinguish', 'lamp');

            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('The player should not be allowed to trigger internal commands like "changeState lamp"', async () => {
            vi.resetAllMocks();
            await controller.processCommand('changeState', 'lamp');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?'));
        });
    });

    describe('Revealing an item after triggering an action', async () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should reveal the coin when looking at the casks', async () => {
            await controller.processCommand('go', 'north');
            const coins = controller.getCurrentRoom().findItem('coin', true);
            expect(coins?.isVisible()).toBeFalsy();

            await controller.processCommand('look', 'casks');

            expect(coins?.isVisible()).toBeTruthy();
        });
    });

    describe('Showing the inventory', async () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say something like "You are not carrying anything." when the user does not possess any items', async () => {
            controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles("You're not carrying anything."));
            expect(ui.displayMessage).toHaveBeenCalledTimes(1);
        });

        it('should print all the visible items the user has in their possession', async () => {
            controller.displayInventory();
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'note');
            await controller.processCommand('take', 'lantern');
            vi.resetAllMocks();

            await controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('You are currently holding the following:\n- '),
                }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Brass lantern') }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('note') }),
            );
            expect(ui.displayMessage).toBeCalledTimes(1);
        });

        it('should print the item state.', async () => {
            controller.displayInventory();
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'note');
            await controller.processCommand('take', 'lantern');
            await controller.processCommand('light', 'lantern');
            vi.resetAllMocks();

            await controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('You are currently holding the following:\n- '),
                }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Brass lantern') }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('flame') }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('note') }),
            );
            expect(ui.displayMessage).toBeCalledTimes(1);
        });
    });
});
