import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { ChangeStateCommand } from 'src/domain/commands/change-state-command.ts';
import type { Command } from 'src/domain/commands/command.ts';
import { DropCommand } from 'src/domain/commands/drop-command.ts';
import { GoCommand } from 'src/domain/commands/go-command.ts';
import { HideCommand } from 'src/domain/commands/hide-command.ts';
import { InvalidCommand } from 'src/domain/commands/invalid-command.ts';
import { InventoryCommand } from 'src/domain/commands/inventory-command.ts';
import { LookCommand } from 'src/domain/commands/look-command.ts';
import { QuitCommand } from 'src/domain/commands/quit-command.ts';
import { RevealCommand } from 'src/domain/commands/reveal-command.ts';
import { SpeakCommand } from 'src/domain/commands/speak-command.ts';
import { SubtractCommand } from 'src/domain/commands/subtract-command.ts';
import { TakeCommand } from 'src/domain/commands/take-command.ts';
import { TalkCommand } from 'src/domain/commands/talk-command.ts';

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

    public create(options: {
        verb: string;
        target?: string;
        allowInternalCommands?: boolean;
    }): Command {
        const command = this.createCommand(options.verb);
        if (!command) return this.invalidCommand();
        if (command.requiresTarget && !options.target)
            return this.invalidCommand();
        if (command.isInternal && !options.allowInternalCommands)
            return this.invalidCommand();

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
