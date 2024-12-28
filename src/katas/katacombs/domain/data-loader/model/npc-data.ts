import { DialogData, NPC, toDialog } from '@katas/katacombs/domain';

export type NpcData = {
    name: string;
    voice?: string;
    greeting: string;
    dialogs: DialogData[];
    description?: NpcDescriptionData;
};

export class NpcDescriptionData {
    room?: string;
    look?: string;
}
export function toNPC(npc: NpcData): NPC {
    return new NPC(npc.name, {
        greeting: npc.greeting,
        dialogs: npc.dialogs.map((dialog) => toDialog(dialog, npc.name)),
        description: npc.description,
    });
}
