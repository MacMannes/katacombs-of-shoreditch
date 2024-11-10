export type Command = {
    requiresSubject?: boolean; // Optional, defaults to true if not specified
    process: (subject: string) => void;
};
