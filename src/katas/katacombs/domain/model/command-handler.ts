export type CommandHandler = {
    requiresTarget?: boolean; // Optional, defaults to true if not specified
    handle: (target: string, value?: string) => void;
};
