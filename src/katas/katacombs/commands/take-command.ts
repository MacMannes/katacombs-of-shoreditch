import { CommandExecuteOptions, Command } from '@katas/katacombs/commands';
import { Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class TakeCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    execute(options?: CommandExecuteOptions): boolean {
        const itemName = options?.params?.at(0);
        if (!itemName) return false;

        const result = this.game.take(itemName);
        const textKey = result.success ? 'msg-ok' : result.error.message;
        this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return result.success;
    }
}
