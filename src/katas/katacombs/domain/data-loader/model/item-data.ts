import { ActionTriggerData, toTriggers } from '@katas/katacombs/domain/data-loader/model';
import { Item, ItemDescription, ItemOptions } from '@katas/katacombs/domain';
import { isDefined } from '@utils/array';
import { CountableItem } from '@katas/katacombs/domain/model';

export type ItemData = {
    name: string;
    type?: ItemTypeData;
    count?: number;
    description: ItemDescriptionData;
    words?: string[];
    visible?: boolean;
    immovable?: boolean;
    triggers?: ActionTriggerData[];
    states?: Record<string, ItemDescriptionData>;
    initialState?: string;
};

export type ItemTypeData = 'countable-item';

export type ItemDescriptionData = {
    room?: string;
    look?: string;
    inventory?: string;
};

export function toItems(globalItems: ItemData[], itemsToCreate?: ItemData[]): Item[] {
    if (!itemsToCreate) return [];

    return itemsToCreate
        .map((itemData) => {
            const globalItem = globalItems.find((it) => it.name === itemData.name);
            if (!globalItem) return undefined;

            return toItem(globalItem, itemData);
        })
        .filter(isDefined);
}

function toItem(item: ItemData, override: ItemData): Item {
    const options: ItemOptions = {
        description: toItemDescription(item.description),
        words: item.words,
        visible: item.visible,
        immovable: item.immovable,
        triggers: toTriggers(item.triggers),
        initialState: item.initialState,
        states: toStates(item.states),
    };

    if (item.type === 'countable-item') {
        return new CountableItem(item.name, {
            ...options,
            count: override.count,
        });
    }

    return new Item(item.name, options);
}

function toStates(states?: Record<string, ItemDescriptionData>) {
    if (!states) return undefined;

    const convertedStates: Record<string, ItemDescription> = {};
    for (const [key, value] of Object.entries(states)) {
        convertedStates[key] = toItemDescription(value);
    }
    return convertedStates;
}

function toItemDescription(description?: ItemDescriptionData): ItemDescription {
    return {
        room: description?.room ?? '',
        look: description?.look ?? '',
        inventory: description?.inventory ?? '',
    };
}
