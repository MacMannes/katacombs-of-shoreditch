import { Command } from './index';
import { UserInterface } from '../../ui';
import { Game } from '../index';

export class InvalidCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(params: string[]): Promise<boolean> {
        this.ui.displayMessage(this.game.getTextWithAudioFiles('msg-what'));
        return true;
    }
}
