import { CommandAction, Condition } from '@katas/katacombs/domain';

export type ActionTrigger = {
    verb: string;
    actions: CommandAction[];
    conditions?: Condition[];
};
