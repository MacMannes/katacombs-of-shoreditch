import { CommandExecuteOptions, Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class RevealCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: false });
    }

    execute(options?: CommandExecuteOptions): boolean {
        return false;
    }
}
