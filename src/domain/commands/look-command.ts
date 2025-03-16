import type { UserInterface } from 'src/ui/user-interface.ts';
import type { Connection } from 'src/domain/model/connection.ts';
import { Direction, isDirection } from 'src/domain/model/direction.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import { TextWithAudioFiles } from 'src/domain/model/text-with-audio-files.ts';
import { Command } from 'src/domain/commands/command.ts';

export class LookCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ requiresTarget: false });
    }

    async execute(params: string[]): Promise<boolean> {
        const at = params[0];

        const message = at ? this.look(at) : this.game.describeRoom('long');
        this.ui.displayMessage(message);

        return true;
    }

    public look(at: string): TextWithAudioFiles {
        if (isDirection(at)) {
            return this.getMessageForLookingInDirection(at);
        }

        const connection = this.game.findConnection(at);
        if (connection) {
            return this.getMessageForLookingAtConnection(connection);
        }

        return (
            this.getMessageForLookingAtItem(at) ??
            this.getMessageForLookingAtNpc(at) ??
            this.game.getTextWithAudioFiles('msg-cant-see-that')
        );
    }

    private getMessageForLookingAtConnection(
        connection?: Connection,
    ): TextWithAudioFiles {
        const textKey = connection?.description ?? 'msg-nothing-interesting';
        return this.game.getTextWithAudioFiles(textKey);
    }

    private getMessageForLookingInDirection(
        direction: Direction,
    ): TextWithAudioFiles {
        const connection = this.game.findConnection(direction);
        const textKey = connection?.description ?? 'msg-nothing-interesting';
        return this.game.getTextWithAudioFiles(textKey);
    }

    private getMessageForLookingAtItem(
        itemName: string,
    ): TextWithAudioFiles | undefined {
        const item = this.game.findItem(itemName);
        if (!item) return undefined;

        const textKeys = item.getDescription('look');
        const text = this.game.getConcatenatedText(textKeys);
        return new TextWithAudioFiles(text, textKeys);
    }

    private getMessageForLookingAtNpc(
        npcName: string,
    ): TextWithAudioFiles | undefined {
        const npc = this.game.findNpc(npcName);
        const textKey = npc?.getDescription('look');
        if (!textKey) return undefined;

        return this.game.getTextWithAudioFiles(textKey);
    }
}
