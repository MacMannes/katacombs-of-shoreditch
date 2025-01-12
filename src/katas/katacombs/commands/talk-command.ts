import { Command } from '@katas/katacombs/commands';
import {
    ActionTriggerExecutor,
    ConditionVerifier,
    Dialog,
    Game,
    isActionDialog,
    isChoiceDialog,
    isConditionDialog,
    NPC,
} from '@katas/katacombs/domain';
import { Choice, UserInterface } from '@katas/katacombs/ui';
import { isDefined } from '@utils/array';

export class TalkCommand extends Command {
    private readonly conditionVerifier: ConditionVerifier;
    private readonly actionTriggerExecutor: ActionTriggerExecutor;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
        this.conditionVerifier = new ConditionVerifier(this.game);
        this.actionTriggerExecutor = new ActionTriggerExecutor(this.game, this.ui);
    }

    async execute(params: string[]): Promise<boolean> {
        const npcName = params[0];
        const npc = this.game.getCurrentRoom().findNpc(npcName);
        if (!npc) {
            const response = this.game.getTextWithAudioFiles('msg-lonely-out-here');
            this.ui.displayMessage(response);
            return false;
        }

        const greeting = this.game.getTextWithAudioFiles(npc.greeting);
        this.ui.displayMessage(greeting);

        const rootDialog = npc.dialogs.find((dialog) => (dialog.id = 'start'));
        if (!rootDialog) return false;

        await this.handleDialog(rootDialog, npc);

        return true;
    }

    private async handleDialog(dialog: Dialog, npc: NPC) {
        let currentDialog: Dialog = dialog;
        let exitDialog = false;
        while (!exitDialog) {
            if (currentDialog.response) {
                const response = this.game.getTextWithAudioFiles(currentDialog.response);
                this.ui.displayMessage(response);
            }

            if (isChoiceDialog(currentDialog)) {
                const choices = currentDialog.choices
                    .map((choice) => npc.dialogs.find((dialog) => dialog.id === choice))
                    .filter(isDefined)
                    .filter((dialog) => this.canShowDialog(dialog))
                    .map((dialog) => this.toChoice(dialog));

                const answer = await this.ui.getUserChoice(choices);
                const answerDialog = npc.dialogs.find((dialog) => dialog.id === answer);
                if (answerDialog) {
                    exitDialog = answerDialog.exit;

                    if (answerDialog.response) {
                        const response = this.game.getTextWithAudioFiles(answerDialog.response);
                        this.ui.displayMessage(response);
                    }

                    currentDialog = answerDialog;
                }
            }

            await this.handleDialogActions(currentDialog, npc);

            if (currentDialog.next) {
                const nextDialog = npc.dialogs.find((dialog) => dialog.id === currentDialog.next);
                if (nextDialog) {
                    currentDialog = nextDialog;
                } else {
                    currentDialog = dialog;
                }
            } else if (isConditionDialog(currentDialog) && currentDialog.postConditions) {
                const conditionsAreMet = this.conditionVerifier.verifyConditions(currentDialog.postConditions);
                const nextDialogId = conditionsAreMet ? currentDialog.success : currentDialog.failure;
                const nextDialog = npc.dialogs.find((dialog) => dialog.id === nextDialogId);
                currentDialog = nextDialog ?? dialog;
            } else {
                currentDialog = dialog;
            }
        }
    }

    private async handleDialogActions(dialog: Dialog, npc: NPC) {
        if (isActionDialog(dialog)) {
            for await (const action of dialog.actions) {
                if (
                    (action.command === 'enableDialog' || action.command === 'disableDialog') &&
                    action.argument === npc.name
                ) {
                    const dialogToChange = npc.dialogs.find((dialog) => dialog.id === action.parameter);
                    if (dialogToChange) {
                        dialogToChange.enabled = action.command === 'enableDialog';
                    }
                } else {
                    await this.actionTriggerExecutor.executeCommandAction(action);
                }
            }
        }
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
