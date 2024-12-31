import { Command } from '@katas/katacombs/commands';
import { ConditionVerifier, Dialog, Game, isChoiceDialog, isConditionDialog } from '@katas/katacombs/domain';
import { Choice, UserInterface } from '@katas/katacombs/ui';
import { isDefined } from '@utils/array';
import chalk from 'chalk';

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

        const rootDialog = npc.dialogs.find((dialog) => (dialog.id = 'start'));
        if (!rootDialog) return false;

        const currentDialog: Dialog = rootDialog;
        let exitDialog = false;
        while (!exitDialog) {
            if (isChoiceDialog(currentDialog)) {
                const choices = currentDialog.choices
                    .map((choice) => npc.dialogs.find((dialog) => dialog.id === choice))
                    .filter(isDefined)
                    .filter((dialog) => this.canShowDialog(dialog))
                    .map((dialog) => this.toChoice(dialog));

                const answer = await this.ui.getUserChoice(choices);
                const answerDialog = npc.dialogs.find((dialog) => dialog.id === answer);
                if (answerDialog) {
                    console.log(chalk.greenBright.bold('❯ ') + answerDialog?.text + `\n`);
                    exitDialog = answerDialog.exit;
                }
            }
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
