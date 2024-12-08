import { Command, CommandExecuteOptions } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';

export class ChangeStateCommand extends Command {
    constructor(private readonly game: Game) {
        super({ isInternal: true });
    }

    execute(options?: CommandExecuteOptions): boolean {
        return false;
    }
}
