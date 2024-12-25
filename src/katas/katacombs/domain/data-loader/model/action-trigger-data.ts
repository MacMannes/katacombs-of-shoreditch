import { ActionTrigger, CommandAction, ConditionData, toConditions } from '@katas/katacombs/domain';

export type ActionTriggerData = {
    verb: string;
    actions: CommandActionData[];
    conditions?: ConditionData[];
};

export type CommandActionData = {
    command: string;
    argument: string;
    parameter?: string;
    responses?: ResponsesData;
};

export type ResponsesData = {
    success?: string;
    failure?: string;
};

export function toCommandAction(action: CommandActionData): CommandAction {
    return {
        command: action.command,
        argument: action.argument,
        parameter: action.parameter,
        responses: action.responses,
    };
}

export function toTriggers(triggers: ActionTriggerData[] | undefined): ActionTrigger[] | undefined {
    if (!triggers) return undefined;

    return triggers.map((trigger) => ({
        verb: trigger.verb,
        actions: trigger.actions.map((action) => toCommandAction(action)),
        conditions: toConditions(trigger.conditions),
    }));
}
