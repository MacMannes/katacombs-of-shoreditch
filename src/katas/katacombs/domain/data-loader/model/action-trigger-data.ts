export type ActionTriggerData = {
    verb: string;
    actions: CommandActionData[];
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
