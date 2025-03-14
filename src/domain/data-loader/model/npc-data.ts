import { DialogData, NPC, toDialog } from 'src/domain';

export type NpcData = {
    name: string;
    voice?: string;
    greeting: string;
    dialogs: DialogData[];
    description?: NpcDescriptionData;
};

/* v8 ignore start */
export class NpcDescriptionData {
    room?: string;
    look?: string;
}
/* v8 ignore end */

export function toNPC(npc: NpcData): NPC {
    return new NPC(npc.name, {
        greeting: npc.greeting,
        dialogs: npc.dialogs.map((dialog) => toDialog(dialog, npc.name)),
        description: npc.description,
    });
}
