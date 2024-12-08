import { Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';

export class ChangeStateCommand extends Command {
    constructor(private readonly game: Game) {
        super({ isInternal: true });
    }

    execute(params: string[]): boolean {
        const [target, value] = params;
        if (!target || !value) return false;

        const item = this.game.findItem(target);
        if (!item || item.getCurrentState() === value) return false;

        item.setState(value);
        return true;
    }
}
