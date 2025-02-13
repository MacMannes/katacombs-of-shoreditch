import { UserInterface } from '@katas/katacombs/ui';
import { CommandProcessor } from 'katas/katacombs/domain/commands';
import { Game } from '@katas/katacombs/domain';

export class GameLoop {
    public readonly commandProcessor: CommandProcessor;
    private readonly ui: UserInterface;

    constructor(game: Game, ui: UserInterface) {
        this.commandProcessor = new CommandProcessor(game, ui);
        this.ui = ui;
    }

    public async play(): Promise<void> {
        let isPlaying = true;

        while (isPlaying) {
            const userInput = (await this.ui.getUserInput()) ?? '';
            const result = await this.commandProcessor.processUserInput(userInput);
            isPlaying = result.isPlaying;
        }
    }
}
