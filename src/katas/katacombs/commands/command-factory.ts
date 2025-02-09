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
        switch (verb) {
            case 'go':
                return new GoCommand(this.game, this.ui);
            case 'look':
                return new LookCommand(this.game, this.ui);
            case 'take':
                return new TakeCommand(this.game, this.ui);
            case 'drop':
                return new DropCommand(this.game, this.ui);
            case 'inventory':
                return new InventoryCommand(this.game, this.ui);
            case 'hide':
                return new HideCommand(this.game, this.ui);
            case 'reveal':
                return new RevealCommand(this.game);
            case 'changeState':
                return new ChangeStateCommand(this.game);
            case 'subtract':
                return new SubtractCommand(this.game);
            case 'speak':
                return new SpeakCommand(this.game, this.ui);
            case 'talk':
                return new TalkCommand(this.game, this.ui);
            case 'quit':
                return new QuitCommand(this.ui);
            default:
                return undefined;
        }
    }
}
