import { ActionTrigger } from '../index';

export class ActionTriggers {
    private readonly triggers: ActionTrigger[];

    constructor(triggers?: ActionTrigger[]) {
        this.triggers = triggers ?? [];
    }

    public getTriggers(withVerb?: string): ActionTrigger[] {
        if (!withVerb) return this.triggers;

        return this.triggers.filter((trigger) => trigger.verb === withVerb);
    }
}
