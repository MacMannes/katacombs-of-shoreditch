import { Command } from '@katas/katacombs/commands';
import { UserInterface } from '@katas/katacombs/ui';
import { Game } from '@katas/katacombs/domain';

export class SpeakCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: true });
    }

    async execute(params: string[]): Promise<boolean> {
        const textKey = params[0];

        this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return true;
    }
}
