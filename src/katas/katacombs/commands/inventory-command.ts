import { Command } from '@katas/katacombs/commands';
import { Game, TextWithAudioFiles } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';

export class InventoryCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ requiresTarget: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(params: []): Promise<boolean> {
        const items = this.game.getInventory();
        if (items.length == 0) {
            this.ui.displayMessage(this.game.getTextWithAudioFiles('msg-not-carrying-anything'));
            return true;
        }

        const textKeys = items.map((item) => item.getDescription('inventory'));
        textKeys.unshift(['msg-carrying-the-following', 'msg-nothing']); // Add these to the beginning of the array
        const text = this.game.getConcatenatedTextForItemKeys(textKeys, '\n- ');
        this.ui.displayMessage(new TextWithAudioFiles(text, textKeys.flat()));

        return true;
    }
}
