import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TextWithAudioFiles } from '@katas/katacombs/domain';
import { createTestGame, commandProcessor, game, ui } from '@katas/katacombs/utils/test-game';

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
            expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
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
                expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
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
                expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
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
});
