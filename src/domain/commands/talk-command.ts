import { Command } from './index';
import {
    ActionTriggerExecutor,
    ChoiceDialog,
    CommandAction,
    ConditionVerifier,
    Dialog,
    Game,
    isActionDialog,
    isChoiceDialog,
    isConditionDialog,
    NPC,
} from '../index';
import { Choice, UserInterface } from '../../ui';
import { isDefined } from '../../utils/array';

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

        const rootDialog = this.findDialog(npc, 'start');
        if (!rootDialog) return false;

        await this.handleDialog(rootDialog, npc);

        return true;
    }

    private async handleDialog(dialog: Dialog, npc: NPC) {
        let currentDialog: Dialog = dialog;
        let exitDialog = false;

        while (!exitDialog) {
            this.handleResponse(currentDialog);

            currentDialog = await this.handleChoice(currentDialog, npc);
            exitDialog = currentDialog.exit; // Should we exit the Dialog?

            await this.handleDialogActions(currentDialog, npc);

            currentDialog = this.determineNextDialog(dialog, npc, currentDialog);
        }
    }

    private async handleChoice(dialog: Dialog, npc: NPC): Promise<Dialog> {
        if (!isChoiceDialog(dialog)) return dialog;

        const choices = this.getChoices(dialog, npc);

        const answer = await this.ui.getUserChoice(choices);
        const answerDialog = this.findDialog(npc, answer);
        if (answerDialog?.response) {
            const response = this.game.getTextWithAudioFiles(answerDialog.response);
            this.ui.displayMessage(response);
        }

        return answerDialog ?? dialog;
    }

    private getChoices(dialog: ChoiceDialog, npc: NPC) {
        return dialog.choices
            .map((choice) => this.findDialog(npc, choice))
            .filter(isDefined)
            .filter((dialog) => this.canShowDialog(dialog))
            .map((dialog) => this.toChoice(dialog));
    }

    private handleResponse(currentDialog: Dialog) {
        if (currentDialog.response) {
            const response = this.game.getTextWithAudioFiles(currentDialog.response);
            this.ui.displayMessage(response);
        }
    }

    private determineNextDialog(rootDialog: Dialog, npc: NPC, currentDialog: Dialog) {
        let nextDialogId: string | undefined = currentDialog.next;

        if (!nextDialogId && isConditionDialog(currentDialog) && currentDialog.postConditions) {
            const conditionsAreMet = this.conditionVerifier.verifyConditions(currentDialog.postConditions);
            nextDialogId = conditionsAreMet ? currentDialog.success : currentDialog.failure;
        }

        return this.findDialog(npc, nextDialogId) ?? rootDialog;
    }

    private findDialog(npc: NPC, dialogId?: string) {
        return npc.dialogs.find((dialog) => dialog.id === dialogId);
    }

    private async handleDialogActions(dialog: Dialog, npc: NPC) {
        if (isActionDialog(dialog)) {
            for await (const action of dialog.actions) {
                await this.handleDialogAction(action, npc);
            }
        }
    }

    private async handleDialogAction(action: CommandAction, npc: NPC) {
        if ((action.command === 'enableDialog' || action.command === 'disableDialog') && action.argument === npc.name) {
            this.enableOrDisableDialog(npc, action);
        } else {
            await this.actionTriggerExecutor.executeCommandAction(action);
        }
    }

    private enableOrDisableDialog(npc: NPC, action: CommandAction) {
        const dialogToChange = this.findDialog(npc, action.parameter);
        if (dialogToChange) {
            dialogToChange.enabled = action.command === 'enableDialog';
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
