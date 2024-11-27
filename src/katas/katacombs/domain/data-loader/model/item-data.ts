import { ActionTriggerData, toTriggers, ConditionData } from '@katas/katacombs/domain/data-loader/model';
import { Item, ItemDescription } from '@katas/katacombs/domain';

export type ItemData = {
    name: string;
    description: ItemDescriptionData;
    words?: string[];
    visible?: boolean;
    immovable?: boolean;
    triggers?: ActionTriggerData[];
    states?: Record<string, ItemDescriptionData>;
    initialState?: string;
};

export type ItemDescriptionData = {
    room?: string;
    look?: string;
    inventory?: string;
};

export function toItems(items?: ItemData[]): Item[] {
    if (!items) return [];

    return items.map((item) => toItem(item));
}

function toItem(item: ItemData): Item {
    return new Item(item.name, {
        description: toItemDescription(item.description),
        words: item.words,
        visible: item.visible,
        immovable: item.immovable,
        triggers: toTriggers(item.triggers),
        initialState: item.initialState,
        states: toStates(item.states),
    });
}

function toStates(states?: Record<string, ItemDescriptionData>) {
    if (!states) return undefined;

    const convertedStates: Record<string, ItemDescription> = {};
    for (const [key, value] of Object.entries(states)) {
        convertedStates[key] = toItemDescription(value);
    }
    return convertedStates;
}

function toItemDescription(description: ItemDescriptionData) {
    return {
        room: description.room ?? '',
        look: description.look ?? '',
        inventory: description.inventory ?? '',
    };
}
