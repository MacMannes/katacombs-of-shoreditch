import { ChoiceDialog, CommandActionData, ConditionData, Dialog } from '@katas/katacombs/domain';

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

export function toDialog(dialog: DialogData): Dialog {
    const result = {
        id: dialog.id,
        text: dialog.text,
        response: dialog.response,
        next: dialog.next,
        exit: dialog.exit ?? false,
        enabled: dialog.enabled ?? true,
        // actions: dialog.actions?.map((action) => toCommandAction(action)),
    };
    if (dialog.choices) {
        (result as ChoiceDialog).choices = dialog.choices;
    }

    return result;
}
