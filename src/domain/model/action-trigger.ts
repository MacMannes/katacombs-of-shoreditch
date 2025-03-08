import { CommandAction, Condition } from '../index';

export type ActionTrigger = {
    verb: string;
    actions: CommandAction[];
    conditions?: Condition[];
};
