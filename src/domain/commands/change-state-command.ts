import { Command } from './index';
import { Game } from '../index';

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
