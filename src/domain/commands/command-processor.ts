import type { UserInterface } from 'src/ui/user-interface.ts';
import { ActionTriggerExecutor } from 'src/domain/model/action-trigger-executor.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { CommandFactory } from 'src/domain/commands/command-factory.ts';
import { CommandPreprocessor } from 'src/domain/commands/command-preprocessor.ts';
import { QuitCommand } from 'src/domain/commands/quit-command.ts';

export type Result = {
    isPlaying: boolean;
};

export class CommandProcessor {
    private readonly commandFactory: CommandFactory;
    private readonly actionTriggerExecutor: ActionTriggerExecutor;
    private readonly preprocessor = new CommandPreprocessor();

    constructor(game: Game, ui: UserInterface) {
        this.commandFactory = new CommandFactory(game, ui);
        this.actionTriggerExecutor = new ActionTriggerExecutor(game, ui);
    }

    public async processUserInput(input: string): Promise<Result> {
        const processedInput = this.preprocessor.process(input);
        const [verb, target] = processedInput.split(' ');
        return this.processCommand(verb, target);
    }

    public async processCommand(
        verb?: string,
        target?: string,
    ): Promise<Result> {
        if (!verb) return { isPlaying: true };

        const didExecuteTrigger = await this.actionTriggerExecutor.execute(
            target,
            verb,
        );
        if (didExecuteTrigger) return { isPlaying: true };

        const command = this.commandFactory.create({ verb, target });
        const result = await command.execute([target ?? ''], {
            caller: 'commandProcessor',
        });
        if (command instanceof QuitCommand) {
            return { isPlaying: !result };
        }

        return { isPlaying: true };
    }
}
