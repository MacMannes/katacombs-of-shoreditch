import { Command } from '@katas/katacombs/commands';
import { CountableItem, Game } from '@katas/katacombs/domain';

export class SubtractCommand extends Command {
    constructor(private readonly game: Game) {
        super({ isInternal: true });
    }

    async execute(params: string[]): Promise<boolean> {
        const [target, value] = params;
        if (!target || !value) return false;

        const amount = parseInt(value);

        const item = this.game.findItem(target);
        if (!(item instanceof CountableItem)) return false;

        return item.subtractCount(amount);
    }
}
