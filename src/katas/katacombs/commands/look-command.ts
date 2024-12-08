import { Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class LookCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ requiresTarget: false });
    }

    execute(params: string[]): boolean {
        const at = params?.at(0);

        const message = at ? this.game.look(at) : this.game.describeRoom('long');
        this.ui.displayMessage(message);

        return true;
    }
}
