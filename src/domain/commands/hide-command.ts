import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { Command } from 'src/domain/commands/command.ts';

export class HideCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: true });
    }

    async execute(params: string[]): Promise<boolean> {
        const target = params[0];
        if (!target) return false;

        const item = this.game.getCurrentRoom().findItem(target, true);
        if (!item || !item.isVisible()) return false;

        item.hide();
        return true;
    }
}
