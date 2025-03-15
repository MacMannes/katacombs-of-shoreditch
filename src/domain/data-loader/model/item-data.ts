import { ActionTriggerData, toTriggers } from 'src/domain/data-loader/model';
import {
    CountableItemDescription,
    Item,
    ContextualItemDescription,
    ItemOptions,
} from 'src/domain';
import { CountableItem } from 'src/domain/model';
import { isDefined } from 'src/utils/array';

export type ItemData = {
    name: string;
    type?: ItemTypeData;
    count?: number;
    description: ItemDescriptionData | CountableItemDescriptionData[];
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

export type CountableItemDescriptionData = ItemDescriptionData & {
    count: number;
};

export function toItems(
    globalItems: ItemData[],
    itemsToCreate?: ItemData[],
): Item[] {
    if (!itemsToCreate) return [];

    return itemsToCreate
        .map((itemData) => {
            const globalItem = globalItems.find(
                (it) => it.name === itemData.name,
            );
            if (!globalItem) return undefined;

            return toItem(globalItem, itemData);
        })
        .filter(isDefined);
}

function toItem(item: ItemData, override: ItemData): Item {
    const options: ItemOptions = {
        description: toItemDescription(
            override.description ?? item.description,
        ),
        synonyms: override.words ?? item.words,
        visible: override.visible ?? item.visible,
        immovable: override.immovable ?? item.immovable,
        triggers: toTriggers(override.triggers ?? item.triggers),
        initialState: override.initialState ?? item.initialState,
        states: toStates(override.states ?? item.states),
    };

    if (item.type === 'countable-item') {
        return new CountableItem(item.name, {
            ...options,
            count: override.count,
            countableDescriptions: toCountableItemDescriptions(
                item.description,
            ),
        });
    }

    return new Item(item.name, options);
}

function toStates(states?: Record<string, ItemDescriptionData>) {
    if (!states) return undefined;

    const convertedStates: Record<string, ContextualItemDescription> = {};
    for (const [key, value] of Object.entries(states)) {
        convertedStates[key] = toItemDescription(value);
    }
    return convertedStates;
}

function toItemDescription(
    description?: ItemDescriptionData | CountableItemDescriptionData[],
): ContextualItemDescription {
    if (!isItemDescriptionData(description)) {
        return {
            room: '',
            look: '',
            inventory: '',
        };
    }

    return {
        room: description?.room ?? '',
        look: description?.look ?? '',
        inventory: description?.inventory ?? '',
    };
}

function toCountableItemDescriptions(
    descriptions?: unknown,
): CountableItemDescription[] | undefined {
    if (!isArrayOfCountableItemDescriptionData(descriptions)) return undefined;

    return descriptions.map((description) => {
        return {
            count: description.count,
            ...toItemDescription(description),
        };
    });
}

function isItemDescriptionData(obj: any): obj is ItemDescriptionData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        (typeof obj.room === 'string' || obj.room === undefined) &&
        (typeof obj.look === 'string' || obj.look === undefined) &&
        (typeof obj.inventory === 'string' || obj.inventory === undefined)
    );
}

function isArrayOfCountableItemDescriptionData(
    value: any,
): value is CountableItemDescriptionData[] {
    return Array.isArray(value) && value.every(isCountableItemDescriptionData);
}

function isCountableItemDescriptionData(
    obj: any,
): obj is CountableItemDescriptionData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.count === 'number' && // Must have a count property of type number
        (typeof obj.room === 'string' || obj.room === undefined) && // Optional room property
        (typeof obj.look === 'string' || obj.look === undefined) && // Optional look property
        (typeof obj.inventory === 'string' || obj.inventory === undefined) // Optional inventory property
    );
}
