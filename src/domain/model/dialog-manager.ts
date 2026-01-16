import type { UserInterface, Choice } from 'src/ui/user-interface.ts';
import { isDefined } from 'src/utils/array/array-utils.ts';
import { ActionTriggerExecutor } from 'src/domain/model/action-trigger-executor.ts';
import type { CommandAction } from 'src/domain/model/command-action.ts';
import { ConditionVerifier } from 'src/domain/model/condition-verifier.ts';
import {
    type Dialog,
    isChoiceDialog,
    type ChoiceDialog,
    isConditionDialog,
    isActionDialog,
} from 'src/domain/model/dialog.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import type { NPC } from 'src/domain/model/npc.ts';

export class DialogManager {
    private readonly conditionVerifier: ConditionVerifier;
    private readonly actionTriggerExecutor: ActionTriggerExecutor;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        this.conditionVerifier = new ConditionVerifier(this.game);
        this.actionTriggerExecutor = new ActionTriggerExecutor(
            this.game,
            this.ui,
        );
    }

    async startConversation(npc: NPC): Promise<void> {
        const rootDialog = this.findDialog(npc, 'start');
        if (!rootDialog) return;

        await this.handleDialogFlow(rootDialog, npc);
    }

    private async handleDialogFlow(
        startDialog: Dialog,
        npc: NPC,
    ): Promise<void> {
        let currentDialog: Dialog = startDialog;
        let exitDialog = false;

        while (!exitDialog) {
            this.displayResponse(currentDialog);
            currentDialog = await this.handleChoice(currentDialog, npc);
            exitDialog = currentDialog.exit;
            await this.executeActions(currentDialog, npc);
            currentDialog = this.determineNextDialog(
                startDialog,
                npc,
                currentDialog,
            );
        }
    }

    private displayResponse(dialog: Dialog): void {
        if (dialog.response) {
            const response = this.game.getTextWithAudioFiles(dialog.response);
            this.ui.displayMessage(response);
        }
    }

    private async handleChoice(dialog: Dialog, npc: NPC): Promise<Dialog> {
        if (!isChoiceDialog(dialog)) return dialog;

        const choices = this.getAvailableChoices(dialog, npc);
        const selectedId = await this.ui.getUserChoice(choices);
        const selectedDialog = this.findDialog(npc, selectedId);

        if (selectedDialog?.response) {
            const response = this.game.getTextWithAudioFiles(
                selectedDialog.response,
            );
            this.ui.displayMessage(response);
        }

        return selectedDialog ?? dialog;
    }

    private getAvailableChoices(dialog: ChoiceDialog, npc: NPC): Choice[] {
        return dialog.choices
            .map((choiceId) => this.findDialog(npc, choiceId))
            .filter(isDefined)
            .filter((dialog) => this.isDialogAvailable(dialog))
            .map((dialog) => this.toChoice(dialog));
    }

    private isDialogAvailable(dialog: Dialog): boolean {
        if (!dialog.enabled) return false;

        if (isConditionDialog(dialog) && dialog.preConditions) {
            return this.conditionVerifier.verifyConditions(
                dialog.preConditions,
            );
        }

        return true;
    }

    private determineNextDialog(
        rootDialog: Dialog,
        npc: NPC,
        currentDialog: Dialog,
    ): Dialog {
        let nextDialogId = currentDialog.next;

        if (
            !nextDialogId &&
            isConditionDialog(currentDialog) &&
            currentDialog.postConditions
        ) {
            const conditionsAreMet = this.conditionVerifier.verifyConditions(
                currentDialog.postConditions,
            );
            nextDialogId = conditionsAreMet
                ? currentDialog.success
                : currentDialog.failure;
        }

        return this.findDialog(npc, nextDialogId) ?? rootDialog;
    }

    private async executeActions(dialog: Dialog, npc: NPC): Promise<void> {
        if (!isActionDialog(dialog)) return;

        for await (const action of dialog.actions) {
            await this.executeAction(action, npc);
        }
    }

    private async executeAction(
        action: CommandAction,
        npc: NPC,
    ): Promise<void> {
        if (this.isDialogStateAction(action) && action.argument === npc.name) {
            this.toggleDialogState(npc, action);
        } else {
            await this.actionTriggerExecutor.executeCommandAction(action);
        }
    }

    private isDialogStateAction(action: CommandAction): boolean {
        return (
            action.command === 'enableDialog' ||
            action.command === 'disableDialog'
        );
    }

    private toggleDialogState(npc: NPC, action: CommandAction): void {
        const dialog = this.findDialog(npc, action.parameter);
        if (dialog) {
            dialog.enabled = action.command === 'enableDialog';
        }
    }

    private findDialog(npc: NPC, dialogId?: string): Dialog | undefined {
        return npc.dialogs.find((dialog) => dialog.id === dialogId);
    }

    private toChoice(dialog: Dialog): Choice {
        return { value: dialog.id, text: dialog.text ?? dialog.id };
    }
}
