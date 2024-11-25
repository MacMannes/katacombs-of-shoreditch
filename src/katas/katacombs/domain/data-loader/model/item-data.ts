import { ActionTriggerData, toTriggers } from '@katas/katacombs/domain/data-loader/model';
import { Item } from '@katas/katacombs/domain';

export type ItemData = {
    name: string;
    description: {
        room?: string;
        look?: string;
        inventory?: string;
    };
    words?: string[];
    visible?: boolean;
    immovable?: boolean;
    triggers?: ActionTriggerData[];
};

export function toItems(items?: ItemData[]): Item[] {
    if (!items) return [];

    return items.map((item) => toItem(item));
}

function toItem(item: ItemData): Item {
    return new Item(item.name, {
        description: {
            room: item.description.room ?? '',
            look: item.description.look ?? '',
            inventory: item.description.inventory ?? '',
        },
        words: item.words,
        visible: item.visible,
        immovable: item.immovable,
        triggers: toTriggers(item.triggers),
    });
}
