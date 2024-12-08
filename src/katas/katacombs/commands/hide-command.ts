import { CommandExecuteOptions, Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class HideCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: true });
    }

    execute(params: string[]): boolean {
        return false;
    }
}
