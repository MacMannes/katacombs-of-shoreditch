import type { Item } from 'src/domain/model/item/item.ts';

export class ItemRepository {
    private items: Item[] = [];

    public getItems(): Item[] {
        return [...this.items];
    }

    public findItem(itemName: string): Item | undefined {
        return this.items.find((item) => item.matches(itemName));
    }

    public addItem(item: Item) {
        this.items.push(item);
    }

    public removeItem(item: Item) {
        this.items = this.items.filter((it) => !it.equals(item));
    }
}
