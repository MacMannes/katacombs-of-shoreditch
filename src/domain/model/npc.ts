import { Dialog } from '../index';

export class NPC {
    public readonly greeting: string;
    public readonly dialogs: Dialog[];
    public readonly description?: NpcDescription;

    constructor(
        public readonly name: string,
        options: NpcOptions,
    ) {
        this.greeting = options.greeting;
        this.dialogs = options.dialogs;
        this.description = options.description;
    }

    public getDescription(context: keyof NpcDescription): string | undefined {
        return this.description?.[context];
    }
}

export type NpcOptions = {
    greeting: string;
    dialogs: Dialog[];
    description?: NpcDescription;
};

export class NpcDescription {
    room?: string;
    look?: string;
}
