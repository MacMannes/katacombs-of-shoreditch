import { Command, CommandExecuteOptions } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class LookCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ requiresTarget: false });
    }

    async execute(options?: CommandExecuteOptions): Promise<boolean> {
        const at = options?.params?.at(0);

        const message = at ? this.game.look(at) : this.game.describeRoom('long');
        await this.ui.displayMessage(message);

        return true;
    }
}
