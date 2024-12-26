import { Dialog } from '@katas/katacombs/domain';

export class NPC {
    constructor(
        public readonly name: string,
        public readonly greeting: string,
        public readonly dialogs: Dialog[],
    ) {}
}
