import { Command } from './index';
import { UserInterface } from '../../ui';
import { Game } from '../index';

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
