import { ActionTriggerExecutor, CommandPreprocessor, Game } from '../index';
import { UserInterface } from '../../ui';
import { CommandFactory } from './command-factory';
import { QuitCommand } from './quit-command';

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

    public async processCommand(verb: string, target?: string): Promise<Result> {
        const didExecuteTrigger = await this.actionTriggerExecutor.execute(target, verb);
        if (didExecuteTrigger) return { isPlaying: true };

        const command = this.commandFactory.create({ verb, target });
        const result = await command.execute([target ?? ''], { caller: 'commandProcessor' });
        if (command instanceof QuitCommand) {
            return { isPlaying: !result };
        }

        return { isPlaying: true };
    }
}
