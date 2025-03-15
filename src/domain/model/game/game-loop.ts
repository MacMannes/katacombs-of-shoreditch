import { UserInterface } from 'src/ui';
import { CommandProcessor } from 'src/domain/commands';
import { Game } from 'src/domain';

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
