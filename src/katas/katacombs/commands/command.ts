import { CallerId } from '@katas/katacombs/domain';

export abstract class Command {
    public isInternal: boolean;
    public requiresTarget: boolean;

    protected constructor(options?: CommandOptions) {
        this.isInternal = options?.isInternal ?? true;
        this.requiresTarget = options?.isInternal ?? false;
    }

    abstract execute(options?: CommandExecuteOptions): Promise<boolean>;
}

export type CommandOptions = {
    isInternal?: boolean; // Optional, defaults to false if not specified
    requiresTarget?: boolean; // Optional, defaults to true if not specified
};

export type CommandExecuteOptions = {
    params: string[];
    caller?: CallerId;
};
