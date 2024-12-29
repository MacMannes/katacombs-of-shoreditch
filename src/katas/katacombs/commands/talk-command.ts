import { Command } from '@katas/katacombs/commands';
import {
    ConditionVerifier,
    Dialog,
    Game,
    isChoiceDialog,
    isConditionDialog,
    TextWithAudioFiles,
} from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
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

        const welcomeText = this.game.getTextWithAudioFiles(npc.greeting);

        await this.ui.displayMessageAsync(welcomeText);

        const dialog = npc.dialogs.find((dialog) => (dialog.id = 'start'));
        if (!dialog) return false;

        const questions: string[] = [];
        if (dialog.text) {
            questions.push(dialog.text);
        }
        if (isChoiceDialog(dialog)) {
            const dialogsFromChoice = dialog.choices
                .map((choice) => npc.dialogs.find((dialog) => dialog.id === choice))
                .filter(isDefined)
                .filter((dialog) => this.canShowDialog(dialog));
            const questionsFromChoice = dialogsFromChoice.map((dialog) => dialog.text).filter(isDefined);
            questions.push(...questionsFromChoice);
        }
        const text = '\n- ' + questions.join('\n- ');

        this.ui.displayMessage(new TextWithAudioFiles(text, []));

        return true;
    }

    private canShowDialog(dialog: Dialog) {
        if (!dialog.enabled) return false;

        if (isConditionDialog(dialog) && dialog.preConditions) {
            return this.conditionVerifier.verifyConditions(dialog.preConditions);
        }

        return true;
    }
}
