import { CommandAction, Condition } from 'src/domain';

export type ActionTrigger = {
    verb: string;
    actions: CommandAction[];
    conditions?: Condition[];
};
