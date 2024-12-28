import { DialogData, NPC, toDialog } from '@katas/katacombs/domain';

export type NpcData = {
    voice?: string;
    greeting: string;
    dialogs: DialogData[];
    description?: NpcDescriptionData;
};

export class NpcDescriptionData {
    room?: string;
    look?: string;
}
export function toNPC(name: string, data: NpcData): NPC {
    return new NPC(name, {
        greeting: data.greeting,
        dialogs: data.dialogs.map((dialog) => toDialog(dialog, name)),
        description: data.description,
    });
}
