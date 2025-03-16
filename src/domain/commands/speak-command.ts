import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { Command } from 'src/domain/commands/command.ts';

export class SpeakCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ isInternal: true });
    }

    async execute(params: string[]): Promise<boolean> {
        const textKey = params[0];
        if (!textKey) return false;

        this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return true;
    }
}
