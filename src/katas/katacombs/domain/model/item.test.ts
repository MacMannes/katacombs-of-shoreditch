import { describe, expect, it } from 'vitest';
import { Item } from '@katas/katacombs/domain';

describe('Item', () => {
    it('should set the current state to the first given state, when no initial state was given', () => {
        const item = new Item('lantern', {
            description: {
                inventory: 'Brass lantern',
                room: 'There is a shiny brass lantern nearby.',
                look: "It's a shiny brass lantern, which runs on oil.",
            },
            states: ['lit', 'unlit'],
        });

        expect(item.currentState).toBe('lit');
    });

    it('should set the current state given initial state', () => {
        const item = new Item('lantern', {
            description: {
                inventory: 'Brass lantern',
                room: 'There is a shiny brass lantern nearby.',
                look: "It's a shiny brass lantern, which runs on oil.",
            },
            states: ['lit', 'unlit'],
            initialState: 'unlit',
        });

        expect(item.currentState).toBe('unlit');
    });
});
