import { CommandExecuteOptions, Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class DropCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    async execute(options?: CommandExecuteOptions): Promise<boolean> {
        const itemName = options?.params?.at(0);
        if (!itemName) return false;

        const dropped = this.game.drop(itemName);
        if (options?.caller === 'triggerAction') return dropped;

        const textKey = dropped ? 'msg-ok' : 'msg-not-carrying-it';
        await this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return dropped;
    }
}
