import { Command } from 'src/domain/commands';
import { CountableItem, Game } from 'src/domain';

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

        const result = item.subtractCount(amount);
        if (!result) return result;

        if (item.getCount() == 0) {
            this.game.removeItemFromInventoryByName(item.name);
        }

        return result;
    }
}
