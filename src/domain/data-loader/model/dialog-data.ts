import type {
    Dialog,
    ChoiceDialog,
    ActionDialog,
    ConditionDialog,
} from 'src/domain/model/dialog.ts';
import {
    type CommandActionData,
    toCommandAction,
} from 'src/domain/data-loader/model/action-trigger-data.ts';
import {
    type ConditionData,
    toConditions,
} from 'src/domain/data-loader/model/condition-data.ts';

export type DialogData = {
    id: string;
    text?: string;
    response?: string;
    next?: string;
    exit?: boolean;
    enabled?: boolean;
    actions?: CommandActionData[];
    choices?: string[];
    'pre-conditions'?: ConditionData[];
    'post-conditions'?: ConditionData[];
    success?: string;
    failure?: string;
};

export function toDialog(dialog: DialogData, npcName?: string): Dialog {
    const result = {
        id: dialog.id,
        text: dialog.text,
        response: dialog.response,
        next: dialog.next,
        exit: dialog.exit ?? false,
        enabled: dialog.enabled ?? true,
    };
    if (dialog.choices) {
        (result as ChoiceDialog).choices = dialog.choices;
    }
    if (dialog.actions) {
        (result as ActionDialog).actions = dialog.actions?.map((action) =>
            mapAction(action, npcName),
        );
    }
    if (dialog['post-conditions']) {
        const conditionDialog = result as ConditionDialog;
        conditionDialog.postConditions = toConditions(
            dialog['post-conditions'],
        );
        conditionDialog.success = dialog.success;
        conditionDialog.failure = dialog.failure;
    }
    if (dialog['pre-conditions']) {
        const conditionDialog = result as ConditionDialog;
        conditionDialog.preConditions = toConditions(dialog['pre-conditions']);
        conditionDialog.success = dialog.success;
        conditionDialog.failure = dialog.failure;
    }

    return result;
}

function mapAction(action: CommandActionData, npcName?: string) {
    if (
        npcName &&
        ['enable-dialog', 'disable-dialog'].includes(action.command)
    ) {
        action.parameter = action.argument;
        action.argument = npcName;
    }

    return toCommandAction(action);
}
