export type ConditionData = {
    currentLocation?: string;
    inInventory?: string;
    hasState?: Record<string, string>; // E.g. { "lamp": "lit" }
};

export function toConditions(conditions: ConditionData[] | undefined) {
    if (!conditions) return undefined;

    return [];
}
