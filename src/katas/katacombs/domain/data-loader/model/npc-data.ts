import { DialogData, NPC } from '@katas/katacombs/domain';

export type NpcData = {
    voice?: string;
    greeting: string;
    dialogs: {
        initial: DialogData[];
        additional: DialogData[];
    };
};

export function toNPC(name: string, data: NpcData): NPC {
    return new NPC(name, data.greeting, {
        initial: [],
        additional: [],
    });
}
