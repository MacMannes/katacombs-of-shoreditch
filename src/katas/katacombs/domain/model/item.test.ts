import { describe, expect, it } from 'vitest';
import { Item } from '@katas/katacombs/domain';

describe('Item', () => {
    const defaultItemOptions = {
        description: {
            inventory: 'Brass lantern',
            room: 'There is a shiny brass lantern nearby.',
            look: "It's a shiny brass lantern, which runs on oil.",
        },
        states: {
            unlit: {
                room: 'It is dark and cold.',
                inventory: 'The lamp is unlit.',
                look: 'It looks like it could be lit.',
            },
            lit: {
                room: 'It shines brightly, illuminating the surroundings.',
                inventory: 'The lamp is currently lit.',
                look: 'The flame dances steadily.',
            },
        },
    };

    describe('Creating a new item', () => {
        it('should set the current state to the first given state, when no initial state was given', () => {
            const item = new Item('lantern', defaultItemOptions);

            expect(item.getCurrentState()).toBe('unlit');
        });

        it('should set the current state given initial state', () => {
            const item = new Item('lantern', { ...defaultItemOptions, initialState: 'lit' });

            expect(item.getCurrentState()).toBe('lit');
        });
    });

    describe('Getting a contextual description', () => {
        const item = new Item('lantern', defaultItemOptions);

        it('should return the description for a room', () => {
            const description = item.getDescription('room');
            expect(description).toBe('There is a shiny brass lantern nearby.');
        });

        it('should return the description for the inventory', () => {
            const description = item.getDescription('inventory');
            expect(description).toBe('Brass lantern');
        });

        it('should return the description for a room', () => {
            const description = item.getDescription('look');
            expect(description).toBe("It's a shiny brass lantern, which runs on oil.");
        });
    });
});
