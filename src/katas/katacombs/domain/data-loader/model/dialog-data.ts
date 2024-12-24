import { CommandActionData, Condition } from '@katas/katacombs/domain';

// Base dialog
export type BaseDialog = {
    id: string;
    text?: string; // The player's line of dialog
    response?: string; // NPC's response key
    next?: string; // ID of the next dialog
    exit?: boolean; // Whether the dialog ends the conversation
};

// Dialogs with actions
export type ActionDialog = BaseDialog & {
    actions: CommandActionData[];
};

// Dialogs with choices
export type ChoiceDialog = BaseDialog & {
    choices: string[]; // IDs of available choices
};

// Dialogs with conditions
export type ConditionDialog = BaseDialog & {
    conditions: Condition[];
    success: string; // ID of the success dialog
    failure: string; // ID of the failure dialog
};

// General dialog type (union of all sub-types)
export type DialogData = BaseDialog | ActionDialog | ChoiceDialog | ConditionDialog;

export function isActionDialog(dialog: DialogData): dialog is ActionDialog {
    return Array.isArray((dialog as ActionDialog).actions);
}

export function isChoiceDialog(dialog: DialogData): dialog is ChoiceDialog {
    return Array.isArray((dialog as ChoiceDialog).choices);
}

export function isConditionDialog(dialog: DialogData): dialog is ConditionDialog {
    return (
        Array.isArray((dialog as ConditionDialog).conditions) &&
        (dialog as ConditionDialog).success !== undefined &&
        (dialog as ConditionDialog).failure !== undefined
    );
}

export function isBaseDialog(dialog: DialogData): dialog is BaseDialog {
    return !isActionDialog(dialog) && !isChoiceDialog(dialog) && !isConditionDialog(dialog);
}
