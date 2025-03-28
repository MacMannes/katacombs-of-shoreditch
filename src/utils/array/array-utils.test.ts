import { describe, expect, it } from 'vitest';
import { isDefined } from 'src/utils/array/array-utils.ts';

describe('isDefined', () => {
    it('should work as an array filter, returning only defined items', () => {
        const array = ['foo', undefined, 'bar'];
        const filteredArray = array.filter(isDefined);
        expect(filteredArray).toStrictEqual(['foo', 'bar']);
    });
});
