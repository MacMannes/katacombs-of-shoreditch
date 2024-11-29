import { isDefined } from '@utils/array';
import { Condition } from '@katas/katacombs/domain';

export type ConditionData = {
    currentLocation?: string;
    inInventory?: string;
    hasState?: [string, string]; // E.g. { "lamp": "lit" }
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
        if (condition.hasState) {
            const [item, state] = condition.hasState;
            if (item && state) {
                return {
                    type: 'hasState',
                    key: item,
                    value: state,
                };
            }
        }

        return undefined;
    }

    return conditions.map((condition) => toCondition(condition)).filter(isDefined);
}
