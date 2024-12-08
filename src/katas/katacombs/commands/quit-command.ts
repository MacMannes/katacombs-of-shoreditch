import { Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class QuitCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ requiresTarget: false });
    }

    execute(params: string[]): boolean {
        return false;
    }
}
