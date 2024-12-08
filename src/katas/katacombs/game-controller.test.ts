import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameFactory, TextWithAudioFiles, YamlDataLoader } from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';
import { NoOpUserInterface } from '@katas/katacombs/ui';
import { GameController } from '@katas/katacombs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('GameController', () => {
    const gameDataPath = path.resolve(__dirname, './resources/test-game-data.yaml'); // Converts to absolute path
    const gameFactory = new GameFactory(new YamlDataLoader());

    const ui = createMockedObject(NoOpUserInterface);
    let controller: GameController;

    async function createGameController() {
        const game = await gameFactory.createGame(gameDataPath);
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
            expect(ui.displayRoomTitle).toHaveBeenCalledTimes(1);
            expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should continue to ask for user input until the user says "quit"', async () => {
            ui.getUserInput.mockResolvedValueOnce('look');
            ui.getUserInput.mockResolvedValueOnce('go north');
            ui.getUserInput.mockResolvedValueOnce('take lamp');

            await controller.startGame();
            expect(ui.displayRoomTitle).toHaveBeenCalledTimes(2);
            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: 'OK.' }));
            expect(ui.displayMessage).toHaveBeenCalledWith(new TextWithAudioFiles('Bye!', ['bye']));
        });
    });

    describe('Quitting the game', async () => {
        it('should show the GoodbyeMessage"', async () => {
            controller.processCommand('quit');

            expect(ui.displayGoodByeMessage).toBeCalled();
        });
    });

    describe('Processing commands', () => {
        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "What?" when the command could not be interpreted', () => {
            controller.processCommand('print', 'invoice');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should say "What?" when an invalid commands with only a verb was given', () => {
            controller.processCommand('relax');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should not say "What?" when command "look" was given without a target', () => {
            controller.processCommand('look');
            expect(ui.displayMessage).not.toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should display the current room when command "look" was given without a target', () => {
            controller.processCommand('look');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('You are standing at the end of a brick lane'),
                }),
            );
        });

        it('should process look commands with a target', () => {
            controller.processCommand('look', 'north');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should say "What?" when the go command was given without a direction', () => {
            controller.processCommand('go');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the go command when a direction was given', () => {
            controller.processCommand('go', 'building');
            expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
        });

        it('should process the take command', () => {
            controller.processCommand('take', 'watch');
            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("Can't find that here.", ['msg-cant-find-that']),
            );
        });

        it('should say "What?" when the take command was given without a target', () => {
            controller.processCommand('take');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the drop command', () => {
            controller.processCommand('drop', 'watch');
            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying it!", ['msg-not-carrying-it']),
            );
        });

        it('should say "What?" when the drop command was given without a target', () => {
            controller.processCommand('drop');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the inventory command', () => {
            controller.processCommand('inventory');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('carrying') }),
            );
        });

        it('should say "What?" when the speak command is used by the user', () => {
            controller.processCommand('speak', 'Hello World!');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
            expect(ui.displayMessage).toBeCalledTimes(1);
        });
    });

    describe('Traveling', () => {
        describe('to an ordinal direction', () => {
            it('should print the new room when the direction is valid', () => {
                controller.processCommand('go', 'north');
                expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when direction is invalid', () => {
                controller.processCommand('go', 'west');
                expect(ui.displayMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ text: expect.stringContaining('no way') }),
                );
            });
        });

        describe('using synonyms of the connection', () => {
            it('should print the new room when traveling to a synonym of the connection was successful', () => {
                controller.processCommand('go', 'building');
                expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when synonym could not be found', () => {
                controller.processCommand('go', 'left');
                expect(ui.displayMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ text: expect.stringContaining('no way') }),
                );
            });
        });
    });

    describe('Looking around', () => {
        it('should show the long description of the room when looking in no specific direction', () => {
            controller.processCommand('look');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('forest of') }),
            );
        });

        it('should show the description when looking in a specific direction with a connection', () => {
            controller.processCommand('look', 'north');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should show the description when looking at one of the synonyms of a connection', () => {
            controller.processCommand('look', 'building');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should show something like "Nothing interesting" when looking in a specific direction with NO connection', () => {
            controller.processCommand('look', 'west');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Nothing interesting') }),
            );
        });

        it('should show something like "Nothing interesting" when looking at a connection with no description', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks();

            controller.processCommand('look', 'outside');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Nothing interesting') }),
            );
        });
    });

    describe('Looking at items', () => {
        it('should show the description of the item when found', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            controller.processCommand('look', 'note');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The note is crumpled') }),
            );
        });

        it('should show the description of the item in the room when when looking at it using a synonym', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            controller.processCommand('look', 'lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('It’s so polished you can see your' + ' reflection'),
                }),
            );
        });

        it('should show the description of the item in the inventory when when looking at it using a synonym', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lantern');
            vi.resetAllMocks();

            controller.processCommand('look', 'lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('It’s so polished you can see your reflection'),
                }),
            );
        });

        it('should show "I see no ... here" when looking at something that is not here', () => {
            controller.processCommand('look', 'note');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: "Can't see that here." }));
        });

        it('should show "I see no ... here" when looking at something that is not visible', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks();

            controller.processCommand('look', 'key');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: "Can't see that here." }));
        });
    });

    describe('Looking at items with trigger conditions', () => {
        it('should tell the rat is guarding the hole when looking at the hole and the rat is still there', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('look', 'hole');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The rat blocks the hole') }),
            );
            expect(ui.displayMessage).not.toHaveBeenLastCalledWith(expect.stringContaining(' The rat blocks the hole'));
        });

        it('should tell a key is found when looking at the hole and the rat is gone', () => {
            controller.processCommand('take', 'cheese');
            controller.processCommand('go', 'north');
            controller.processCommand('drop', 'cheese');
            controller.processCommand('look', 'hole');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('tiny key') }),
            );
        });

        it('should set the hole state to "examined" after looking at it and the state was "unguarded"', () => {
            controller.processCommand('take', 'cheese');
            controller.processCommand('go', 'north');
            controller.processCommand('drop', 'cheese');

            const hole = controller.getCurrentRoom().findItem('hole');
            expect(hole?.getCurrentState()).toBe('unguarded');

            controller.processCommand('look', 'hole');
            expect(hole?.getCurrentState()).toBe('examined');
        });
    });

    describe('Taking items', () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "OK." when the item exists in the room', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should say something like can not find ..." when the item can not be found in the room', () => {
            controller.processCommand('take', 'note');

            expect(ui.displayMessage).toBeCalledWith(expect.objectContaining({ text: "Can't find that here." }));
        });

        it('should say something like can not find ..." when the item in the room is invisible', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks();

            controller.processCommand('take', 'coin');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("Can't find that here.", ['msg-cant-find-that']),
            );
        });

        it('should move the item from the room to the inventory when it exists in the room', () => {
            controller.processCommand('go', 'north');
            expect(controller.getCurrentRoom().findItem('note')).toBeDefined();
            controller.processCommand('take', 'note');

            expect(controller.getCurrentRoom().findItem('note')).toBeUndefined();
            expect(controller.getInventory().find((item) => item.matches('note'))).toBeDefined();
        });

        it('should say "OK." when taking an item using a synonym', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lamp');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should not allow immovable objects to be taken', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'desk');

            const items = controller.getInventory().map((item) => item.name);
            expect(items).not.toContain('desk');
        });

        it('should say "You can`t be serious!" when trying to take an immovable object', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'desk');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You can't be serious!", ['msg-cant-be-serious']),
            );
        });
    });

    describe('Dropping items', () => {
        it('should move the item from inventory to the room when the user possesses the item', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'note');
            controller.processCommand('go', 'south');
            controller.processCommand('drop', 'note');

            expect(controller.getCurrentRoom().findItem('note')).toBeDefined();
            expect(controller.getInventory().find((item) => item.matches('note'))).toBeUndefined();
        });

        it('should say "OK" when the item is dropped', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'note');
            controller.processCommand('go', 'south');
            vi.resetAllMocks();

            controller.processCommand('drop', 'note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should NOT say "OK" when an item is dropped by a trigger action', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lamp');
            controller.processCommand('go', 'south');
            vi.resetAllMocks();

            controller.processCommand('drop', 'lamp');

            expect(ui.displayMessage).not.toBeCalledWith('OK.');
        });

        it('should say something like "You are not carrying it!" when the user does not possess the item', () => {
            controller.processCommand('drop', 'note');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying it!", ['msg-not-carrying-it']),
            );
        });

        it('should say "OK." when dropping an item using a synonym', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'note');

            vi.resetAllMocks();
            controller.processCommand('drop', 'memo');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });
    });

    describe('Dropping items with trigger conditions', () => {
        it('should say "OK." when dropping cheese in start room, because trigger conditions are not met', () => {
            controller.processCommand('take', 'cheese');

            vi.resetAllMocks();
            controller.processCommand('drop', 'cheese');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should not say "OK." when dropping cheese in building, because trigger conditions are met', () => {
            controller.processCommand('take', 'cheese');
            controller.processCommand('go', 'north');

            vi.resetAllMocks();
            controller.processCommand('drop', 'cheese');

            expect(ui.displayMessage).not.toBeCalledWith('OK.');
        });

        it('should hide the rat and the cheese when dropping cheese in building', () => {
            controller.processCommand('take', 'cheese');
            controller.processCommand('go', 'north');

            vi.resetAllMocks();
            controller.processCommand('drop', 'cheese');

            const rat = controller.getCurrentRoom().findItem('rat', true);
            expect(rat?.isVisible()).toBeFalsy();
            const cheese = controller.getCurrentRoom().findItem('cheese', true);
            expect(cheese?.isVisible()).toBeFalsy();
        });
    });

    describe('Changing the state of items', () => {
        beforeEach(() => {
            createGameController();
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lantern');
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should show the initial state of the lamp', () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('should set the lamp to lit with the command "light lamp"', () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            controller.processCommand('light', 'lamp');

            expect(lamp?.getCurrentState()).toBe('lit');
        });

        it('should not say "What?" after giving the command "light lamp"', () => {
            controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).not.toBeCalledWith('What?');
        });

        it('should say the success response after giving the command "light lamp"', () => {
            controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('bursts into a steady flame') }),
            );
        });

        it('should say the failure response after giving the command "light lamp" twice', () => {
            controller.processCommand('light', 'lamp');
            vi.resetAllMocks();

            controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('overachieve') }),
            );
        });

        it('should say the success response after giving the command "distinguish lamp"', () => {
            controller.processCommand('light', 'lamp');
            vi.resetAllMocks();

            controller.processCommand('extinguish', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('you extinguish the lantern') }),
            );
        });

        it('should say the failure response after giving the command "distinguish lamp"', () => {
            controller.processCommand('extinguish', 'lamp');
            vi.resetAllMocks();

            controller.processCommand('extinguish', 'lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('An epic battle') }),
            );
        });

        it('should set the lamp to lit with the command "extinguish lamp"', () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            controller.processCommand('light', 'lamp');
            expect(lamp?.getCurrentState()).toBe('lit');

            controller.processCommand('extinguish', 'lamp');

            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('The player should not be allowed to trigger internal commands like "changeState lamp"', () => {
            vi.resetAllMocks();
            controller.processCommand('changeState', 'lamp');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });
    });

    describe('Revealing an item after triggering an action', () => {
        it('should reveal the coin when looking at the casks', () => {
            controller.processCommand('go', 'north');
            const coins = controller.getCurrentRoom().findItem('coin', true);
            expect(coins?.isVisible()).toBeFalsy();

            controller.processCommand('look', 'casks');

            expect(coins?.isVisible()).toBeTruthy();
        });
    });

    describe('Triggering speak actions', () => {
        it('should play an mp3 file when a speak action was triggered', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lamp');
            controller.processCommand('rub', 'lamp');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    audioFiles: ['rub-lantern'],
                }),
            );
        });
    });

    describe('Showing the inventory', () => {
        it('should say something like "You are not carrying anything." when the user does not possess any items', () => {
            controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying anything.", ['msg-not-carrying-anything']),
            );
            expect(ui.displayMessage).toHaveBeenCalledTimes(1);
        });

        it('should print all the visible items the user has in their possession', () => {
            controller.displayInventory();
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'note');
            controller.processCommand('take', 'lantern');
            vi.resetAllMocks();

            controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('You are currently holding the following:\n- '),
                }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('Brass lantern'),
                }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('note') }),
            );
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({
                    audioFiles: [
                        'msg-carrying-the-following',
                        'msg-nothing',
                        'item-note-inventory',
                        'item-lantern-inventory',
                    ],
                }),
            );
            expect(ui.displayMessage).toBeCalledTimes(1);
        });

        it('should print the item state.', () => {
            controller.displayInventory();
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'note');
            controller.processCommand('take', 'lantern');
            controller.processCommand('light', 'lantern');
            vi.resetAllMocks();

            controller.displayInventory();

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
