import { Item, NPC } from '@katas/katacombs/domain';

export class RoomInventory {
    private items: Item[] = [];
    private npcs: NPC[] = [];

    public getItems(allowInvisibleItems: boolean): Item[] {
        return this.items.filter((item) => allowInvisibleItems || item.isVisible());
    }

    public addItem(item: Item): void {
        this.items.push(item);
    }

    public addItems(items: Item[]): void {
        this.items.push(...items);
    }

    public removeItem(item: Item): void {
        this.items = this.items.filter((it) => !it.equals(item));
    }

    public getNpcs(): NPC[] {
        return this.npcs;
    }

    public addNpcs(npcs: NPC[]): void {
        this.npcs.push(...npcs);
    }

    public findNpc(name: string): NPC | undefined {
        return this.npcs.find((npc) => npc.name === name);
    }

    public findItem(name: string, allowInvisibleItem: boolean): Item | undefined {
        return this.items.find((item) => item.matches(name) && (allowInvisibleItem || item.isVisible()));
    }
}
