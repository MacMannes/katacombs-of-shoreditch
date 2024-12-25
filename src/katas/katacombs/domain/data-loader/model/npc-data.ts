import { DialogData, NPC, toDialog } from '@katas/katacombs/domain';

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
        initial: data.dialogs.initial.map((dialog) => toDialog(dialog)),
        additional: data.dialogs.additional.map((dialog) => toDialog(dialog)),
    });
}
