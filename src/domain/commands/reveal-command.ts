import { Command } from 'src/domain/commands';
import { Game } from 'src/domain';

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
