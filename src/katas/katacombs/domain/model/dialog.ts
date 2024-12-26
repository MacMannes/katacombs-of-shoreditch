import { CommandAction, Condition } from '@katas/katacombs/domain';

// Base dialog
export type BaseDialog = {
    id: string;
    text?: string; // The player's line of dialog
    response?: string; // NPC's response key
    next?: string; // ID of the next dialog
    exit?: boolean; // Whether the dialog ends the conversation
};

// Dialogs with actions
export type ActionDialogData = BaseDialog & {
    actions: CommandAction[];
};

// Dialogs with choices
export type ChoiceDialog = BaseDialog & {
    choices: string[]; // IDs of available choices
};

// Dialogs with conditions
export type ConditionDialog = BaseDialog & {
    preConditions?: Condition[];
    postConditions?: Condition[];
    success: string; // ID of the success dialog
    failure: string; // ID of the failure dialog
};

// General dialog type (union of all sub-types)
export type Dialog = BaseDialog | ActionDialogData | ChoiceDialog | ConditionDialog;

export function isActionDialog(dialog: Dialog): dialog is ActionDialogData {
    return Array.isArray((dialog as ActionDialogData).actions);
}

export function isChoiceDialog(dialog: Dialog): dialog is ChoiceDialog {
    return Array.isArray((dialog as ChoiceDialog).choices);
}

export function isConditionDialog(dialog: Dialog): dialog is ConditionDialog {
    const conditionDialog = dialog as ConditionDialog;
    return (
        Array.isArray(conditionDialog.preConditions || conditionDialog.postConditions) &&
        conditionDialog.success !== undefined &&
        conditionDialog.failure !== undefined
    );
}

export function isBaseDialog(dialog: Dialog): dialog is BaseDialog {
    return !isActionDialog(dialog) && !isChoiceDialog(dialog) && !isConditionDialog(dialog);
}
