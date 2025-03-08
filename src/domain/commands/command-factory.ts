import { Game } from '../index';
import { UserInterface } from '../../ui';
import {
    ChangeStateCommand,
    Command,
    DropCommand,
    GoCommand,
    HideCommand,
    InvalidCommand,
    InventoryCommand,
    LookCommand,
    QuitCommand,
    RevealCommand,
    SpeakCommand,
    SubtractCommand,
    TakeCommand,
    TalkCommand,
} from './index';

export class CommandFactory {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    private readonly commandMap = new Map<string, () => Command | undefined>([
        ['go', () => new GoCommand(this.game, this.ui)],
        ['look', () => new LookCommand(this.game, this.ui)],
        ['take', () => new TakeCommand(this.game, this.ui)],
        ['drop', () => new DropCommand(this.game, this.ui)],
        ['inventory', () => new InventoryCommand(this.game, this.ui)],
        ['hide', () => new HideCommand(this.game, this.ui)],
        ['reveal', () => new RevealCommand(this.game)],
        ['changeState', () => new ChangeStateCommand(this.game)],
        ['subtract', () => new SubtractCommand(this.game)],
        ['speak', () => new SpeakCommand(this.game, this.ui)],
        ['talk', () => new TalkCommand(this.game, this.ui)],
        ['quit', () => new QuitCommand(this.ui)],
    ]);

    public create(options: { verb: string; target?: string; allowInternalCommands?: boolean }): Command {
        const command = this.createCommand(options.verb);
        if (!command) return this.invalidCommand();
        if (command.requiresTarget && !options.target) return this.invalidCommand();
        if (command.isInternal && !options.allowInternalCommands) return this.invalidCommand();

        return command;
    }

    private invalidCommand(): Command {
        return new InvalidCommand(this.game, this.ui);
    }

    private createCommand(verb: string): Command | undefined {
        const commandCreator = this.commandMap.get(verb);
        return commandCreator ? commandCreator() : undefined;
    }
}
