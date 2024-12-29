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

export class CommandFactory {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {}

    public create(verb: string, target?: string): Command | undefined {
        const command = this.createCommand(verb);
        if (!command || (command.requiresTarget && !target)) {
            return undefined;
        }
        return command;
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
