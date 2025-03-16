import type { CallerId } from 'src/domain/model/caller-id.ts';

export type CommandHandler = {
    requiresTarget?: boolean; // Optional, defaults to true if not specified
    isInternal?: boolean; // Optional, defaults to false if not specified
    handle: (target: string, value?: string, caller?: CallerId) => boolean;
};
