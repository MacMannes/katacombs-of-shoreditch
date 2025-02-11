import { UserInterface } from '@katas/katacombs/ui';
import { Game } from '@katas/katacombs/domain';
import { Command } from '@katas/katacombs/commands/command';
import { GoCommand } from '@katas/katacombs/commands/go-command';
import { LookCommand } from '@katas/katacombs/commands/look-command';
import { QuitCommand } from '@katas/katacombs/commands/quit-command';
import { ChangeStateCommand } from '@katas/katacombs/commands/change-state-command';
import { RevealCommand } from '@katas/katacombs/commands/reveal-command';
import { HideCommand } from '@katas/katacombs/commands/hide-command';
import { DropCommand } from '@katas/katacombs/commands/drop-command';
import { InventoryCommand } from '@katas/katacombs/commands/inventory-command';
import { TakeCommand } from '@katas/katacombs/commands/take-command';
import { SpeakCommand } from '@katas/katacombs/commands/speak-command';
import { TalkCommand } from '@katas/katacombs/commands/talk-command';
import { SubtractCommand } from '@katas/katacombs/commands/subtract-command';
import { InvalidCommand } from '@katas/katacombs/commands/invalid-command';

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
