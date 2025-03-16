import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { Command } from 'src/domain/commands/command.ts';

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
