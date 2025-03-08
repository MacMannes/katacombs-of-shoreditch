import { Command } from './index';
import { Game } from '../index';
import { UserInterface } from '../../ui';

export class HideCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: true });
    }

    async execute(params: string[]): Promise<boolean> {
        const target = params[0];

        const item = this.game.getCurrentRoom().findItem(target, true);
        if (!item || !item.isVisible()) return false;

        item.hide();
        return true;
    }
}
