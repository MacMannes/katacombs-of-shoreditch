export type CommandHandler = {
    requiresSubject?: boolean; // Optional, defaults to true if not specified
    handle: (subject: string) => void;
};
