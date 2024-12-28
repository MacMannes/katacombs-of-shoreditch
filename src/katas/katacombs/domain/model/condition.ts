export type Condition = {
    type: ConditionType;
    key: string;
    value: string;
};

export type ConditionType = 'location' | 'hasItem' | 'hasState';
