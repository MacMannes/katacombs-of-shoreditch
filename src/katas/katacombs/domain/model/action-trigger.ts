import { CommandAction } from '@katas/katacombs/domain';

export type ActionTrigger = {
    verb: string;
    actions: CommandAction[];
};
