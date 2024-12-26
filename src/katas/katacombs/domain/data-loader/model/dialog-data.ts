import { CommandActionData, ConditionData, Dialog } from '@katas/katacombs/domain';

export type DialogData = {
    id: string;
    text?: string;
    response?: string;
    next?: string;
    exit?: boolean;
    actions?: CommandActionData[];
    choices?: string[];
    conditions?: ConditionData[];
    success?: string;
    failure?: string;
};

export function toDialog(dialog: DialogData): Dialog {
    return {
        id: dialog.id,
        text: dialog.text,
        response: dialog.response,
        next: dialog.next,
        // actions: dialog.actions?.map((action) => toCommandAction(action)),
    };
}
