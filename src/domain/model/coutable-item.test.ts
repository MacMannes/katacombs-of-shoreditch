import { describe, expect, test } from 'vitest';
import { CountableItem } from '../index';

describe('CountableItem', () => {
    const item = new CountableItem('coin', {
        description: { room: 'coin', inventory: 'coin', look: 'coin' },
        countableDescriptions: [
            { count: 1, room: 'one', inventory: 'one', look: 'one' },
            { count: 2, room: 'few', inventory: 'few', look: 'few' },
            { count: 10, room: 'handful', inventory: 'handful', look: 'handful' },
            { count: 100, room: 'bounty', inventory: 'bounty', look: 'bounty' },
        ],
    });

    test.each([
        [1, 'one'],
        [2, 'few'],
        [3, 'few'],
        [9, 'few'],
        [10, 'handful'],
        [99, 'handful'],
        [100, 'bounty'],
        [1001, 'bounty'],
    ])(`The description of an item with count "%i" should be "%s"`, (count: number, expected: string) => {
        item.setCount(count);
        const result = item.getDescription('room')[0];

        expect(result).toBe(expected);
    });
});
