import type { Game } from 'src/domain/model/game/game.ts';
import { Command } from 'src/domain/commands/command.ts';

export class RevealCommand extends Command {
    constructor(private readonly game: Game) {
        super({ isInternal: false });
    }

    async execute(params: string[]): Promise<boolean> {
        const target = params[0];
        if (!target) return false;

        const item = this.game.getCurrentRoom().findItem(target, true);
        if (!item || item.isVisible()) return false;

        item.reveal();
        return true;
    }
}
