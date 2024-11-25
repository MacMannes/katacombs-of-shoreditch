import { ActionTriggerData } from '@katas/katacombs/domain/data-loader/model';

export type ItemData = {
    name: string;
    description: {
        room?: string;
        look?: string;
        inventory?: string;
    };
    words?: string[];
    visible?: boolean;
    immovable?: boolean;
    triggers?: ActionTriggerData[];
};
