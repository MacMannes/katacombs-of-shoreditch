import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameController } from 'src/game-controller.ts';
import { TextWithAudioFiles } from 'src/domain/model/text-with-audio-files.ts';
import { createTestGame, game, ui } from 'src/utils/test/test-game.ts';

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
            expect(ui.displayRoomTitle).toHaveBeenCalledWith(
                'Lost in Shoreditch',
            );
        });

        it('should continue to ask for user input until the user says "quit"', async () => {
            ui.getUserInput.mockResolvedValueOnce('look');
            ui.getUserInput.mockResolvedValueOnce('go north');
            ui.getUserInput.mockResolvedValueOnce('take lamp');

            await controller.startGame();
            expect(ui.displayRoomTitle).toHaveBeenCalledTimes(2);
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'OK.' }),
            );
            expect(ui.displayMessageAsync).toHaveBeenCalledWith(
                new TextWithAudioFiles('Bye!', ['msg-bye']),
            );
        });

        it('should process the go command when a just a shortened direction was given', async () => {
            ui.getUserInput.mockResolvedValueOnce('n');
            await controller.startGame();

            expect(ui.displayRoomTitle).toHaveBeenCalledWith(
                'Lost in Shoreditch',
            );
        });
    });
});
