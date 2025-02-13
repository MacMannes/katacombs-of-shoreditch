import { Command } from '@katas/katacombs/domain/commands';
import { Game } from '@katas/katacombs/domain';

export class RevealCommand extends Command {
    constructor(private readonly game: Game) {
        super({ isInternal: false });
    }

    async execute(params: string[]): Promise<boolean> {
        const target = params[0];

        const item = this.game.getCurrentRoom().findItem(target, true);
        if (!item || item.isVisible()) return false;

        item.reveal();
        return true;
    }
}
