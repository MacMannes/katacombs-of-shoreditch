import { DialogData } from '@katas/katacombs/domain';

export type NpcData = {
    voice?: string;
    response: string;
    dialog: {
        initial: DialogData[];
        additional: DialogData[];
    };
};
