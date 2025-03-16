import { CommandProcessor } from 'src/domain/commands/command-processor.ts';
import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Game } from 'src/domain/model/game/game.ts';

export class GameLoop {
    private readonly commandProcessor: CommandProcessor;
    private readonly ui: UserInterface;

    constructor(game: Game, ui: UserInterface) {
        this.commandProcessor = new CommandProcessor(game, ui);
        this.ui = ui;
    }

    public async play(): Promise<void> {
        let isPlaying = true;

        while (isPlaying) {
            const userInput = (await this.ui.getUserInput()) ?? '';
            const result =
                await this.commandProcessor.processUserInput(userInput);
            isPlaying = result.isPlaying;
        }
    }
}
