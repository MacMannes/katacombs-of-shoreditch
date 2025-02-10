import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NPC, TextWithAudioFiles } from '@katas/katacombs/domain';
import { expectToBeDefined } from '@utils/test';
import { GameController } from '@katas/katacombs';
import { CountableItem } from '@katas/katacombs/domain/model/countable-item';
import { createTestGame, game, ui } from '@katas/katacombs/utils/test-game';

describe('GameController', () => {
    let controller: GameController;

    async function createGameController() {
        await createTestGame();
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
            expect(ui.displayMessageAsync).toHaveBeenCalledWith(new TextWithAudioFiles('Bye!', ['msg-bye']));
        });

        it('should process the go command when a just a shortened direction was given', async () => {
            ui.getUserInput.mockResolvedValueOnce('n');
            await controller.startGame();

            expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
        });
    });

    describe('Changing the state of items', () => {
        beforeEach(async () => {
            await createGameController();
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'lantern');
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should show the initial state of the lamp', () => {
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
                expect.objectContaining({ text: expect.stringContaining('you extinguish the lantern') }),
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

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });
    });

    describe('Revealing an item after triggering an action', () => {
        it('should reveal the coin when looking at the casks', async () => {
            await controller.processCommand('go', 'north');
            const coins = controller.getCurrentRoom().findItem('coin', true);
            expect(coins?.isVisible()).toBeFalsy();

            await controller.processCommand('look', 'casks');

            expect(coins?.isVisible()).toBeTruthy();
        });
    });

    describe('Triggering speak actions', () => {
        it('should play an mp3 file when a speak action was triggered', async () => {
            await controller.processCommand('go', 'north');
            await controller.processCommand('take', 'lamp');
            await controller.processCommand('rub', 'lamp');

            expect(ui.displayMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    audioFiles: ['rub-lantern'],
                }),
            );
        });
    });

    describe('Showing the inventory', () => {
        it('should say something like "You are not carrying anything." when the user does not possess any items', async () => {
            await controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying anything.", ['msg-not-carrying-anything']),
            );
            expect(ui.displayMessage).toHaveBeenCalledTimes(1);
        });

        it('should print all the visible items the user has in their possession', async () => {
            await controller.displayInventory();
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
            await controller.displayInventory();
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

        it('should print the count of countable items', async () => {
            await controller.displayInventory();
            await controller.processCommand('look', 'gully');
            await controller.processCommand('take', 'coin');
            await controller.processCommand('go', 'north');
            await controller.processCommand('look', 'casks');
            await controller.processCommand('take', 'coin');
            vi.resetAllMocks();

            await controller.displayInventory();

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
            await controller.processCommand('go', 'south');
            await controller.processCommand('go', 'east');
            shopkeeper = controller.getCurrentRoom().findNpc('shopkeeper');
        });

        it('should say the greeting of the NPC when the user talks to it', async () => {
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Welcome, traveler') }),
            );
        });

        it('should say "It’s lonely out here" when there is no NPC to talk to', async () => {
            await controller.processCommand('go', 'west');
            await controller.processCommand('talk', 'shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('it’s lonely out here') }),
            );
        });

        it('should only ask enabled questions', async () => {
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

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

            await controller.processCommand('talk', 'shopkeeper');

            const dialog = shopkeeper?.dialogs?.find((dialog) => dialog.id === 'why-only-two-items');
            expect(dialog?.enabled).toBeFalsy();
        });

        it('should disable "ask-about-shovel" and enable "are-you-serious" after asking about the shovekl', async () => {
            ui.getUserChoice.mockResolvedValueOnce('ask-about-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

            const askAboutShovelDialog = shopkeeper?.dialogs?.find((dialog) => dialog.id === 'ask-about-shovel');
            expect(askAboutShovelDialog?.enabled).toBeFalsy();

            const areYouSeriousDialog = shopkeeper?.dialogs?.find((dialog) => dialog.id === 'are-you-serious');
            expect(areYouSeriousDialog?.enabled).toBeTruthy();
        });

        it('should ask which item to buy when the user selects dialog "buy-something"', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('never-mind');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

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

            await controller.processCommand('talk', 'shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Ah, a fine question! Well, it all started') }),
            );
        });

        it('should answer with the response expected response when the Dialog is a ChoiceDialog', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('never-mind');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('That’ll be 100 coins.') }),
            );
        });

        it('should answer with the failure response dialog when the the user does not have enough money', async () => {
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

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

            await controller.processCommand('take', 'coins');
            await controller.processCommand('talk', 'shopkeeper');

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

            await controller.processCommand('take', 'coins');
            await controller.processCommand('talk', 'shopkeeper');

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

            await controller.processCommand('take', 'coins');
            await controller.processCommand('talk', 'shopkeeper');

            expect(controller.getInventory().find((item) => item.name === 'shovel')).toBeDefined();
        });

        it('should not say "OK" after taking the bought item', async () => {
            await controller.processCommand('take', 'coins');
            vi.resetAllMocks();

            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

            expect(ui.displayMessage).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('OK.'),
                }),
            );
        });

        it("should reduce the user's coins by 100 after buying the shovel", async () => {
            await controller.processCommand('take', 'coins');
            vi.resetAllMocks();

            const coins = controller.getInventory().find((item) => item.name === 'coin');
            expectToBeDefined(coins);
            const numberOfCoins = (coins as CountableItem).getCount();

            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

            expect((coins as CountableItem).getCount()).toBe(numberOfCoins - 100);
        });

        it('should remove the coins from inventory when the user has paid everything they had', async () => {
            await controller.processCommand('take', 'coins');
            vi.resetAllMocks();

            let coins = controller.getInventory().find((item) => item.name === 'coin');
            expect(coins).toBeDefined();

            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-lighter');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-lighter');
            ui.getUserChoice.mockResolvedValueOnce('buy-something');
            ui.getUserChoice.mockResolvedValueOnce('choose-shovel');
            ui.getUserChoice.mockResolvedValueOnce('pay-for-shovel');
            ui.getUserChoice.mockResolvedValueOnce('bye');

            await controller.processCommand('talk', 'shopkeeper');

            coins = controller.getInventory().find((item) => item.name === 'coin');
            expect(coins).toBeUndefined();
        });
    });
});
