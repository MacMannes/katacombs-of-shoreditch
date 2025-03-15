import {
    Item,
    ContextualItemDescription,
    ItemOptions,
} from 'src/domain/model/item/item';
import { isDefined } from 'src/utils/array';

export class CountableItem extends Item {
    private count: number;
    private readonly countableDescriptions: CountableItemDescription[];

    constructor(name: string, options: CountableItemOptions) {
        super(name, options);
        this.count = options.count ?? 1; // Default count is 1
        this.countableDescriptions = options?.countableDescriptions ?? [];
    }

    override getDescription(
        context: keyof ContextualItemDescription,
    ): string[] {
        const description = this.countableDescriptions
            .sort((a, b) => b.count - a.count)
            .find((it) => it.count <= this.count);

        const baseDescription = description?.[context];
        const stateDescription = super.getDescription(context).at(1);

        const textKeys = [baseDescription, stateDescription].filter(isDefined);

        if (context === 'inventory' && this.count > 1) {
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

    public subtractCount(amount: number): boolean {
        if (this.count < amount) return false;

        this.count -= amount;
        return true;
    }

    public setCount(amount: number) {
        this.count = amount;
    }

    public mergeWith(other: CountableItem) {
        if (this.name !== other.name) {
            throw new Error('Cannot merge items with different names.');
        }
        this.addCount(other.getCount());
        other.setCount(0);
    }
}

export type CountableItemOptions = ItemOptions & {
    count?: number;
    countableDescriptions?: CountableItemDescription[];
};

export type CountableItemDescription = ContextualItemDescription & {
    count: number;
};
