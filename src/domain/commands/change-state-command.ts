import type { Game } from 'src/domain/model/game/game.ts';
import { Command } from 'src/domain/commands/command.ts';

export class ChangeStateCommand extends Command {
    constructor(private readonly game: Game) {
        super({ isInternal: true });
    }

    async execute(params: string[]): Promise<boolean> {
        const [target, value] = params;
        if (!target || !value) return false;

        const item = this.game.findItem(target);
        if (!item || item.getCurrentState() === value) return false;

        item.setState(value);
        return true;
    }
}
