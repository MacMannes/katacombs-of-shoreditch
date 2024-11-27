import { isDefined } from '@utils/array';
import { Condition } from '@katas/katacombs/domain';

export type ConditionData = {
    currentLocation?: string;
    inInventory?: string;
    hasState?: Record<string, string>; // E.g. { "lamp": "lit" }
};

export function toConditions(conditions: ConditionData[] | undefined) {
    if (!conditions) return undefined;

    function toCondition(condition: ConditionData): Condition | undefined {
        if (condition.currentLocation) {
            return {
                type: 'location',
                key: 'currentLocation',
                value: condition.currentLocation,
            };
        }

        return undefined;
    }

    return conditions.map((condition) => toCondition(condition)).filter(isDefined);
}
