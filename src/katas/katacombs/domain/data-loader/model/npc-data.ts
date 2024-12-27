import { DialogData, NPC, toDialog } from '@katas/katacombs/domain';

export type NpcData = {
    voice?: string;
    greeting: string;
    dialogs: DialogData[];
};

export function toNPC(name: string, data: NpcData): NPC {
    return new NPC(
        name,
        data.greeting,
        data.dialogs.map((dialog) => toDialog(dialog, name)),
    );
}
