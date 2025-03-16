import type { CommandAction } from 'src/domain/model/command-action.ts';
import type { Condition } from 'src/domain/model/condition.ts';

export type ActionTrigger = {
    verb: string;
    actions: CommandAction[];
    conditions?: Condition[];
};
