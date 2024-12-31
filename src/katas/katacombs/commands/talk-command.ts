import { Command } from '@katas/katacombs/commands';
import {
    ConditionVerifier,
    Dialog,
    Game,
    isChoiceDialog,
    isConditionDialog,
    TextWithAudioFiles,
} from '@katas/katacombs/domain';
import { Choice, UserInterface } from '@katas/katacombs/ui';
import { isDefined } from '@utils/array';

export class TalkCommand extends Command {
    private readonly conditionVerifier: ConditionVerifier;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
        this.conditionVerifier = new ConditionVerifier(this.game);
    }

    async execute(params: string[]): Promise<boolean> {
        const npcName = params[0];
        const npc = this.game.getCurrentRoom().findNpc(npcName);
        if (!npc) return false;

        const greeting = this.game.getTextWithAudioFiles(npc.greeting);
        this.ui.displayMessage(greeting);

        const dialog = npc.dialogs.find((dialog) => (dialog.id = 'start'));
        if (!dialog) return false;

        if (isChoiceDialog(dialog)) {
            const choices = dialog.choices
                .map((choice) => npc.dialogs.find((dialog) => dialog.id === choice))
                .filter(isDefined)
                .filter((dialog) => this.canShowDialog(dialog))
                .map((dialog) => this.toChoice(dialog));

            const answer = await this.ui.getUserChoice(choices);
            console.error(answer);
        }

        return false;
    }

    private canShowDialog(dialog: Dialog) {
        if (!dialog.enabled) return false;

        if (isConditionDialog(dialog) && dialog.preConditions) {
            return this.conditionVerifier.verifyConditions(dialog.preConditions);
        }

        return true;
    }

    private toChoice(dialog: Dialog): Choice {
        return { value: dialog.id, text: dialog.text ?? dialog.id };
    }
}
