import { Item, ItemDescription, ItemOptions } from './item';

export class CountableItem extends Item {
    private count: number;

    constructor(name: string, options: CountableItemOptions) {
        super(name, options);
        this.count = options.count ?? 1; // Default count is 1
    }

    override getDescription(context: keyof ItemDescription): string[] {
        const textKeys = super.getDescription(context);

        if (this.count > 1) {
            textKeys.push(`count:${this.count}`);
        }

        return textKeys;
    }

    public getCount(): number {
        return this.count;
    }

    public addCount(amount: number) {
        this.count += amount;
    }

    public mergeWith(other: CountableItem) {
        if (this.name !== other.name) {
            throw new Error('Cannot merge items with different names.');
        }
        this.addCount(other.getCount());
        other.setCount(0);
    }

    // Setter for count (used internally to reset count)
    private setCount(amount: number) {
        this.count = amount;
    }
}

export type CountableItemOptions = ItemOptions & {
    count?: number;
};
