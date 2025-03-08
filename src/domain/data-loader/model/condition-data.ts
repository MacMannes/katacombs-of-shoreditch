import { Condition } from '../../model';
import { isDefined } from '../../../utils/array';

export type ConditionData = {
    'current-location'?: string;
    'has-item'?: string | [string, string]; // e.g. book or [ coin, 10 ]
    'has-state'?: [string, string]; // E.g. [ lamp, lit ]
};

export function toConditions(conditions: ConditionData[] | undefined) {
    if (!conditions) return undefined;

    function toCondition(condition: ConditionData): Condition | undefined {
        if (condition['current-location']) {
            return {
                type: 'location',
                key: 'currentLocation',
                value: condition['current-location'],
            };
        }
        if (condition['has-state']) {
            const [item, state] = condition['has-state'];
            if (item && state) {
                return {
                    type: 'hasState',
                    key: item,
                    value: state,
                };
            }
        }
        if (condition['has-item']) {
            const hasItem = condition['has-item'];
            const [item, count] = typeof hasItem === 'string' ? [hasItem] : hasItem;
            if (item) {
                return {
                    type: 'hasItem',
                    key: item,
                    value: count ?? '',
                };
            }
        }

        return undefined;
    }

    return conditions.map((condition) => toCondition(condition)).filter(isDefined);
}
