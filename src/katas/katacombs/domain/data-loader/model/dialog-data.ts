import { CommandActionData, ConditionData } from '@katas/katacombs/domain';

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
