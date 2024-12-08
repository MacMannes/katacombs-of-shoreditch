import { Command } from '@katas/katacombs/commands';
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
        const target = params[0];

        const item = this.game.getCurrentRoom().findItem(target, true);
        if (!item || !item.isVisible()) return false;

        item.hide();
        return true;
    }
}
