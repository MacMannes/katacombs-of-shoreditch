import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountableItem, NPC, TextWithAudioFiles } from '../index';
import { createTestGame, commandProcessor, game, ui } from '@utils/test/test-game';
import { expectToBeDefined } from '@utils/test';

describe('CommandProcessor', () => {
    beforeEach(async () => {
        await createTestGame();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Processing User input', () => {
        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "What?" when the command could not be interpreted', async () => {
            await commandProcessor.processUserInput('print invoice');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should say "What?" when an invalid commands with only a verb was given', async () => {
            await commandProcessor.processUserInput('relax');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should not say "What?" when command "look" was given without a target', async () => {
            await commandProcessor.processUserInput('look');
            expect(ui.displayMessage).not.toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should display the current room when command "look" was given without a target', async () => {
            await commandProcessor.processUserInput('look');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('You are standing at the end of a brick lane'),
                }),
            );
        });

        it('should process look commands with a target', async () => {
            await commandProcessor.processUserInput('look north');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should say "What?" when the go command was given without a direction', async () => {
            await commandProcessor.processUserInput('go');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the go command when a direction was given', async () => {
            await commandProcessor.processUserInput('go building');
            expect(ui.displayRoomTitle).toHaveBeenCalledWith('Inside the building');
        });

        it('should process the take command', async () => {
            await commandProcessor.processUserInput('take watch');
            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("Can't find that here.", ['msg-cant-find-that']),
            );
        });

        it('should say "What?" when the take command was given without a target', async () => {
            await commandProcessor.processUserInput('take');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the drop command', async () => {
            await commandProcessor.processUserInput('drop watch');
            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying it!", ['msg-not-carrying-it']),
            );
        });

        it('should say "What?" when the drop command was given without a target', async () => {
            await commandProcessor.processUserInput('drop');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the inventory command', async () => {
            await commandProcessor.processUserInput('inventory');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('carrying') }),
            );
        });

        it('should say "What?" when the speak command is used by the user', async () => {
            await commandProcessor.processUserInput('speak HelloWorld!');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
            expect(ui.displayMessage).toBeCalledTimes(1);
        });
    });

    describe('Traveling', () => {
        describe('to an ordinal direction', () => {
            it('should print the new room when the direction is valid', async () => {
                await commandProcessor.processUserInput('go north');
                expect(ui.displayRoomTitle).toHaveBeenCalledWith('Inside the building');
            });

            it('should print a message when direction is invalid', async () => {
                await commandProcessor.processUserInput('go west');
                expect(ui.displayMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ text: expect.stringContaining('no way') }),
                );
            });
        });

        describe('using synonyms of the connection', () => {
            it('should print the new room when traveling to a synonym of the connection was successful', async () => {
                await commandProcessor.processUserInput('go building');
                expect(ui.displayRoomTitle).toHaveBeenCalledWith('Inside the building');
            });

            it('should print a message when synonym could not be found', async () => {
                await commandProcessor.processUserInput('go left');
                expect(ui.displayMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ text: expect.stringContaining('no way') }),
                );
            });
        });
    });

    describe('Looking around', () => {
        it('should show the long description of the room when looking in no specific direction', async () => {
            await commandProcessor.processUserInput('look');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('forest of') }),
            );
        });

        it('should show the description when looking in a specific direction with a connection', async () => {
            await commandProcessor.processUserInput('look  north');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should show the description when looking at one of the synonyms of a connection', async () => {
            await commandProcessor.processUserInput('look  building');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should show something like "Nothing interesting" when looking in a specific direction with NO connection', async () => {
            await commandProcessor.processUserInput('look  west');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Nothing interesting') }),
            );
        });

        it('should show something like "Nothing interesting" when looking at a connection with no description', async () => {
            await commandProcessor.processUserInput('go  north');

            await commandProcessor.processUserInput('look  outside');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Nothing interesting') }),
            );
        });

        it('should show the description of the NPC when looking at the room', async () => {
            await commandProcessor.processUserInput('go  south');
            await commandProcessor.processUserInput('go  east');

            await commandProcessor.processUserInput('look');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The shopkeeper stands behind the counter') }),
            );
        });

        it('should not print the description of the NPC when going into the room a second time', async () => {
            await commandProcessor.processUserInput('go  south');
            await commandProcessor.processUserInput('go  east');
            await commandProcessor.processUserInput('go  west');

            await commandProcessor.processUserInput('go  east');

            expect(ui.displayMessage).not.toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The shopkeeper stands behind the counter') }),
            );
        });
    });

    describe('Looking at items', () => {
        it('should show the description of the item when found', async () => {
            await commandProcessor.processUserInput('go north');

            await commandProcessor.processUserInput('look note');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The note is crumpled') }),
            );
        });

        it('should not print the count of a CountableItem when looking', async () => {
            await commandProcessor.processUserInput('look gully');

            expect(ui.displayMessage).not.toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('(2)') }),
            );
        });

        it('should show the description of the item in the room when when looking at it using a synonym', async () => {
            await commandProcessor.processUserInput('go north');

            await commandProcessor.processUserInput('look lamp');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('It’s so polished you can see your' + ' reflection'),
                }),
            );
        });

        it('should show the description of the item in the inventory when when looking at it using a synonym', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take lantern');

            await commandProcessor.processUserInput('look lamp');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('It’s so polished you can see your reflection'),
                }),
            );
        });

        it('should show "I see no ... here" when looking at something that is not here', async () => {
            await commandProcessor.processUserInput('look note');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.objectContaining({ text: "Can't see that here." }));
        });

        it('should show "I see no ... here" when looking at something that is not visible', async () => {
            await commandProcessor.processUserInput('go north');

            await commandProcessor.processUserInput('look key');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: "Can't see that here." }),
            );
        });
    });

    describe('Looking at NPCs', () => {
        it('should show the description of the NPC', async () => {
            await commandProcessor.processUserInput('go south');
            await commandProcessor.processUserInput('go east');

            await commandProcessor.processUserInput('look shopkeeper');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The shopkeeper’s sun-kissed skin') }),
            );
        });
    });

    describe('Looking at items with trigger conditions', () => {
        it('should tell the rat is guarding the hole when looking at the hole and the rat is still there', async () => {
            await commandProcessor.processUserInput('go north');

            await commandProcessor.processUserInput('look hole');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('The rat blocks the hole') }),
            );
            expect(ui.displayMessage).not.toHaveBeenLastCalledWith(expect.stringContaining(' The rat blocks the hole'));
        });

        it('should tell a key is found when looking at the hole and the rat is gone', async () => {
            await commandProcessor.processUserInput('take cheese');
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('drop cheese');

            await commandProcessor.processUserInput('look hole');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({ text: expect.stringContaining('tiny key') }),
            );
        });

        it('should set the hole state to "examined" after looking at it and the state was "unguarded"', async () => {
            await commandProcessor.processUserInput('take cheese');
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('drop cheese');

            const hole = game.getCurrentRoom().findItem('hole');
            expect(hole?.getCurrentState()).toBe('unguarded');

            await commandProcessor.processUserInput('look hole');

            expect(hole?.getCurrentState()).toBe('examined');
        });
    });

    describe('Taking items', () => {
        it('should say "OK." when the item exists in the room', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should say something like can not find ..." when the item can not be found in the room', async () => {
            await commandProcessor.processUserInput('take note');

            expect(ui.displayMessage).toBeCalledWith(expect.objectContaining({ text: "Can't find that here." }));
        });

        it('should say something like can not find ..." when the item in the room is invisible', async () => {
            await commandProcessor.processUserInput('go north');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('take coin');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("Can't find that here.", ['msg-cant-find-that']),
            );
        });

        it('should move the item from the room to the inventory when it exists in the room', async () => {
            await commandProcessor.processUserInput('go north');
            expect(game.getCurrentRoom().findItem('note')).toBeDefined();
            await commandProcessor.processUserInput('take note');

            expect(game.getCurrentRoom().findItem('note')).toBeUndefined();
            expect(game.getInventory().find((item) => item.matches('note'))).toBeDefined();
        });

        it('should say "OK." when taking an item using a synonym', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take lamp');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should not allow immovable objects to be taken', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take desk');

            const items = game.getInventory().map((item) => item.name);
            expect(items).not.toContain('desk');
        });

        it('should say "You can`t be serious!" when trying to take an immovable object', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take desk');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You can't be serious!", ['msg-cant-be-serious']),
            );
        });

        it('should merge countable items to one item when picked up', async () => {
            await commandProcessor.processUserInput('look gully');
            await commandProcessor.processUserInput('take coin');
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('look casks');
            await commandProcessor.processUserInput('take coin');

            const coins = game.getInventory().filter((item) => item.name === 'coin');
            expect(coins).toHaveLength(1);
            expect((coins[0] as unknown) instanceof CountableItem).toBeTruthy();
            expect((coins[0] as unknown as CountableItem).getCount()).toBe(3);
        });
    });

    describe('Dropping items', () => {
        it('should move the item from inventory to the room when the user possesses the item', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take note');
            await commandProcessor.processUserInput('go south');
            await commandProcessor.processUserInput('drop note');

            expect(game.getCurrentRoom().findItem('note')).toBeDefined();
            expect(game.getInventory().find((item) => item.matches('note'))).toBeUndefined();
        });

        it('should say "OK" when the item is dropped', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take note');
            await commandProcessor.processUserInput('go south');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('drop note');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should NOT say "OK" when an item is dropped by a trigger action', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take lamp');
            await commandProcessor.processUserInput('go south');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('drop lamp');

            expect(ui.displayMessage).not.toBeCalledWith('OK.');
        });

        it('should say something like "You are not carrying it!" when the user does not possess the item', async () => {
            await commandProcessor.processUserInput('drop note');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying it!", ['msg-not-carrying-it']),
            );
        });

        it('should say "OK." when dropping an item using a synonym', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take note');

            vi.resetAllMocks();
            await commandProcessor.processUserInput('drop memo');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should merge countable items to one item when dropped', async () => {
            await commandProcessor.processUserInput('look gully');
            await commandProcessor.processUserInput('take coin');
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('look casks');
            await commandProcessor.processUserInput('drop coin');

            const coins = game
                .getCurrentRoom()
                .getItems()
                .filter((item) => item.name === 'coin');
            expect(coins).toHaveLength(1);
            expect((coins[0] as unknown) instanceof CountableItem).toBeTruthy();
            expect((coins[0] as unknown as CountableItem).getCount()).toBe(3);
        });
    });

    describe('Dropping items with trigger conditions', () => {
        it('should say "OK." when dropping cheese in start room, because trigger conditions are not met', async () => {
            await commandProcessor.processUserInput('take cheese');

            vi.resetAllMocks();
            await commandProcessor.processUserInput('drop cheese');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('OK.', ['msg-ok']));
        });

        it('should not say "OK." when dropping cheese in building, because trigger conditions are met', async () => {
            await commandProcessor.processUserInput('take cheese');
            await commandProcessor.processUserInput('go north');

            vi.resetAllMocks();
            await commandProcessor.processUserInput('drop cheese');

            expect(ui.displayMessage).not.toBeCalledWith('OK.');
        });

        it('should hide the rat and the cheese when dropping cheese in building', async () => {
            await commandProcessor.processUserInput('take cheese');
            await commandProcessor.processUserInput('go north');

            vi.resetAllMocks();
            await commandProcessor.processUserInput('drop cheese');

            const rat = game.getCurrentRoom().findItem('rat', true);
            expect(rat?.isVisible()).toBeFalsy();
            const cheese = game.getCurrentRoom().findItem('cheese', true);
            expect(cheese?.isVisible()).toBeFalsy();
        });
    });

    describe('Changing the state of items', () => {
        beforeEach(async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take lantern');
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should show the initial state of the lamp', () => {
            const lamp = game.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('should set the lamp to lit with the command "light lamp"', async () => {
            const lamp = game.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            await commandProcessor.processUserInput('light lamp');

            expect(lamp?.getCurrentState()).toBe('lit');
        });

        it('should not say "What?" after giving the command "light lamp"', async () => {
            await commandProcessor.processUserInput('light lamp');
            expect(ui.displayMessage).not.toBeCalledWith('What?');
        });

        it('should say the success response after giving the command "light lamp"', async () => {
            await commandProcessor.processUserInput('light lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('bursts into a steady flame') }),
            );
        });

        it('should say the failure response after giving the command "light lamp" twice', async () => {
            await commandProcessor.processUserInput('light lamp');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('light lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('overachieve') }),
            );
        });

        it('should say the success response after giving the command "distinguish lamp"', async () => {
            await commandProcessor.processUserInput('light lamp');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('extinguish lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('you extinguish the lantern') }),
            );
        });

        it('should say the failure response after giving the command "distinguish lamp"', async () => {
            await commandProcessor.processUserInput('extinguish lamp');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('extinguish lamp');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('An epic battle') }),
            );
        });

        it('should set the lamp to lit with the command "extinguish lamp"', async () => {
            const lamp = game.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            await commandProcessor.processUserInput('light lamp');
            expect(lamp?.getCurrentState()).toBe('lit');

            await commandProcessor.processUserInput('extinguish lamp');

            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('The player should not be allowed to trigger internal commands like "changeState lamp"', async () => {
            vi.resetAllMocks();
            await commandProcessor.processUserInput('changeState lamp');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });
    });

    describe('Revealing an item after triggering an action', () => {
        it('should reveal the coin when looking at the casks', async () => {
            await commandProcessor.processUserInput('go north');
            const coins = game.getCurrentRoom().findItem('coin', true);
            expect(coins?.isVisible()).toBeFalsy();

            await commandProcessor.processUserInput('look casks');

            expect(coins?.isVisible()).toBeTruthy();
        });
    });

    describe('Triggering speak actions', () => {
        it('should play an mp3 file when a speak action was triggered', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take lamp');
            await commandProcessor.processUserInput('rub lamp');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    audioFiles: ['rub-lantern'],
                }),
            );
        });
    });

    describe('Showing the inventory', () => {
        it('should say something like "You are not carrying anything." when the user does not possess any items', async () => {
            await commandProcessor.processUserInput('inventory');

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying anything.", ['msg-not-carrying-anything']),
            );
            expect(ui.displayMessage).toHaveBeenCalledTimes(1);
        });

        it('should print all the visible items the user has in their possession', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take note');
            await commandProcessor.processUserInput('take lantern');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('inventory');

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

        it('should print the item state.', async () => {
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('take note');
            await commandProcessor.processUserInput('take lantern');
            await commandProcessor.processUserInput('light lantern');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('inventory');

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

        it('should print the count of countable items', async () => {
            await commandProcessor.processUserInput('look gully');
            await commandProcessor.processUserInput('take coin');
            await commandProcessor.processUserInput('go north');
            await commandProcessor.processUserInput('look casks');
            await commandProcessor.processUserInput('take coin');
            vi.resetAllMocks();

            await commandProcessor.processUserInput('inventory');

            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('(3)'),
                }),
            );
        });
    });

    describe('Talking to NPCs', () => {
        let shopkeeper: NPC | undefined = undefined;

        beforeEach(async () => {
            await commandProcessor.processUserInput('go south');
            await commandProcessor.processUserInput('go east');
            shopkeeper = game.getCurrentRoom().findNpc('shopkeeper');
        });

        it('should say the greeting of the NPC when the user talks to it', async () => {
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Welcome, traveler') }),
            );
        });

        it('should say "It’s lonely out here" when there is no NPC to talk to', async () => {
            await commandProcessor.processUserInput('go west');
            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('it’s lonely out here') }),
            );
        });

        it('should only ask enabled questions', async () => {
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.getUserChoice).toHaveBeenLastCalledWith([
                {
                    text: 'Why only two items?',
                    value: 'why-only-two-items',
                },
                {
                    text: 'Tell me about the lighter.',
                    value: 'ask-about-lighter',
                },
                {
                    text: 'What’s so special about the shovel?',
                    value: 'ask-about-shovel',
                },
                {
                    text: 'I’ll take something.',
                    value: 'buy-something',
                },
                {
                    text: 'Never mind, I’ll be on my way.',
                    value: 'bye',
                },
            ]);
        });

        it('should disable the dialog "why-only-two-items" after asking it', async () => {
            ui.getUserChoice.mockResolvedValueOnce('why-only-two-items');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            const dialog = shopkeeper?.dialogs?.find((dialog) => dialog.id === 'why-only-two-items');
            expect(dialog?.enabled).toBeFalsy();
        });

        it('should disable "ask-about-shovel" and enable "are-you-serious" after asking about the shovekl', async () => {
            ui.getUserChoice.mockResolvedValueOnce('ask-about-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            const askAboutShovelDialog = shopkeeper?.dialogs?.find((dialog) => dialog.id === 'ask-about-shovel');
            expect(askAboutShovelDialog?.enabled).toBeFalsy();

            const areYouSeriousDialog = shopkeeper?.dialogs?.find((dialog) => dialog.id === 'are-you-serious');
            expect(areYouSeriousDialog?.enabled).toBeTruthy();
        });

        it('should ask which item to buy when the user selects dialog "buy-something"', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('never-mind');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.getUserChoice).toHaveBeenNthCalledWith(2, [
                {
                    text: 'I’ll take the lighter.',
                    value: 'choose-lighter',
                },
                {
                    text: 'I’ll take the shovel.',
                    value: 'choose-shovel',
                },
                {
                    text: 'Never mind.',
                    value: 'never-mind',
                },
            ]);
        });

        it('should answer with the response expected response', async () => {
            ui.getUserChoice.mockResolvedValueOnce('why-only-two-items');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Ah, a fine question! Well, it all started') }),
            );
        });

        it('should answer with the response expected response when the Dialog is a ChoiceDialog', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('never-mind');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('That’ll be 100 coins.') }),
            );
        });

        it('should answer with the failure response dialog when the the user does not have enough money', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('Oh dear… looks like your purse is feeling a little light'),
                }),
            );
        });

        it('should answer with the success response dialog when the the user does not have enough money', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('take coins');
            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining(
                        'Ah, a sound investment, my friend! Here’s your Torch of Eternity™.',
                    ),
                }),
            );
        });

        it('should answer with the success response dialog when the the user does not have enough money', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('take coins');
            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining(
                        'Ah, a sound investment, my friend! Here’s your Torch of Eternity™.',
                    ),
                }),
            );
        });

        it('should put the shovel in the inventory after buying it', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('take coins');
            await commandProcessor.processUserInput('talk shopkeeper');

            expect(game.getInventory().find((item) => item.name === 'shovel')).toBeDefined();
        });

        it('should not say "OK" after taking the bought item', async () => {
            await commandProcessor.processUserInput('take coins');
            vi.resetAllMocks();

            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect(ui.displayMessage).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('OK.'),
                }),
            );
        });

        it("should reduce the user's coins by 100 after buying the shovel", async () => {
            await commandProcessor.processUserInput('take coins');
            vi.resetAllMocks();

            //TODO: introduce Game.findItemInInventory
            const coins = game.getInventory().find((item) => item.name === 'coin');
            expectToBeDefined(coins);
            const numberOfCoins = (coins as CountableItem).getCount();

            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            expect((coins as CountableItem).getCount()).toBe(numberOfCoins - 100);
        });

        it('should remove the coins from inventory when the user has paid everything they had', async () => {
            await commandProcessor.processUserInput('take coins');
            vi.resetAllMocks();

            let coins = game.getInventory().find((item) => item.name === 'coin');
            expect(coins).toBeDefined();

            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await commandProcessor.processUserInput('talk shopkeeper');

            coins = game.getInventory().find((item) => item.name === 'coin');
            expect(coins).toBeUndefined();
        });
    });
});
