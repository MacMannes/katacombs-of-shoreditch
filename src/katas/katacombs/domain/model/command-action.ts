export type CommandAction = {
    command: string;
    target?: string; // Target could be an item or room name
    value?: string;
};
