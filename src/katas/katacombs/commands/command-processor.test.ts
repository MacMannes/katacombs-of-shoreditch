// noinspection DuplicatedCode

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';
import path from 'node:path';
import { Game, GameFactory, TextWithAudioFiles, YamlDataLoader } from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';
import { NoOpUserInterface } from '@katas/katacombs/ui';
import { CommandProcessor } from '@katas/katacombs/commands/command-processor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('CommandProcessor', () => {
    const gameDataPath = path.resolve(__dirname, '../resources/test-game-data.yaml'); // Converts to absolute path
    const gameFactory = new GameFactory(new YamlDataLoader());

    const ui = createMockedObject(NoOpUserInterface);
    let processor: CommandProcessor;
    let game: Game;

    async function createCommandProcessor() {
        game = await gameFactory.createGame(gameDataPath);
        processor = new CommandProcessor(game, ui);
    }

    beforeEach(async () => {
        await createCommandProcessor();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Processing User input', () => {
        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "What?" when the command could not be interpreted', async () => {
            await processor.processUserInput('print invoice');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should say "What?" when an invalid commands with only a verb was given', async () => {
            await processor.processUserInput('relax');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should not say "What?" when command "look" was given without a target', async () => {
            await processor.processUserInput('look');
            expect(ui.displayMessage).not.toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should display the current room when command "look" was given without a target', async () => {
            await processor.processUserInput('look');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: expect.stringContaining('You are standing at the end of a brick lane'),
                }),
            );
        });

        it('should process look commands with a target', async () => {
            await processor.processUserInput('look north');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('I see a brick building with a sign saying') }),
            );
        });

        it('should say "What?" when the go command was given without a direction', async () => {
            await processor.processUserInput('go');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the go command when a direction was given', async () => {
            await processor.processUserInput('go building');
            expect(ui.displayRoomTitle).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
        });

        it('should process the take command', async () => {
            await processor.processUserInput('take watch');
            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("Can't find that here.", ['msg-cant-find-that']),
            );
        });

        it('should say "What?" when the take command was given without a target', async () => {
            await processor.processUserInput('take');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the drop command', async () => {
            await processor.processUserInput('drop watch');
            expect(ui.displayMessage).toBeCalledWith(
                new TextWithAudioFiles("You're not carrying it!", ['msg-not-carrying-it']),
            );
        });

        it('should say "What?" when the drop command was given without a target', async () => {
            await processor.processUserInput('drop');
            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
        });

        it('should process the inventory command', async () => {
            await processor.processUserInput('inventory');
            expect(ui.displayMessage).toBeCalledWith(
                expect.objectContaining({ text: expect.stringContaining('carrying') }),
            );
        });

        it('should say "What?" when the speak command is used by the user', async () => {
            await processor.processUserInput('speak HelloWorld!');

            expect(ui.displayMessage).toBeCalledWith(new TextWithAudioFiles('What?', ['msg-what']));
            expect(ui.displayMessage).toBeCalledTimes(1);
        });
    });
});
