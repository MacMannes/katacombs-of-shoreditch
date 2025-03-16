import { Item, type ItemOptions } from 'src/domain/model/item/item.ts';

export class ContainerItem extends Item {
    private open: boolean;

    constructor(name: string, options: ContainerItemOptions) {
        super(name, options);
        this.open = options.open;
    }

    isOpen(): boolean {
        return this.open;
    }

    close() {
        this.open = false;
    }
}

export type ContainerItemOptions = ItemOptions & {
    open: boolean;
};
