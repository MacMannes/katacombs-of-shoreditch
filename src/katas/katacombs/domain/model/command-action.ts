export type CommandAction = {
    command: string;
    argument: string;
    parameter?: string;
    responses?: Responses;
};

type Responses = {
    success?: string;
    failure?: string;
};
