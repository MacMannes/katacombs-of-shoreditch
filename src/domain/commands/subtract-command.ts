import type { Game } from 'src/domain/model/game/game.ts';
import { CountableItem } from 'src/domain/model/item/countable-item.ts';
import { Command } from 'src/domain/commands/command.ts';

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
