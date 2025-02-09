import { ActionTriggerExecutor, CommandPreprocessor, Game, TextWithAudioFiles } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import { CommandFactory } from '@katas/katacombs/commands/command-factory';
import { QuitCommand } from '@katas/katacombs/commands/quit-command';

export type Result = {
    isPlaying: boolean;
};

export class CommandProcessor {
    private readonly commandFactory: CommandFactory;
    private readonly actionTriggerExecutor: ActionTriggerExecutor;
    private readonly preprocessor = new CommandPreprocessor();

    constructor(
        game: Game,
        private readonly ui: UserInterface,
    ) {
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

        const command = this.commandFactory.create(verb, target);
        if (!command || command.isInternal) {
            this.ui.displayMessage(new TextWithAudioFiles('What?', ['msg-what']));
            return { isPlaying: true };
        }

        const result = await command.execute([target ?? ''], { caller: 'commandProcessor' });
        if (command instanceof QuitCommand) {
            return { isPlaying: !result };
        }

        return { isPlaying: true };
    }
}
