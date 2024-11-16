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
                inventory: '(unlit)',
                look: 'It looks like it could be lit.',
            },
            lit: {
                room: 'It shines brightly, illuminating the surroundings.',
                inventory: '(lit)',
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
        const item = new Item('lantern', { ...defaultItemOptions, states: undefined });

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

    describe('Getting a contextual description for the lamp with unlit state', () => {
        const item = new Item('lantern', { ...defaultItemOptions });

        it('should return the description and the current state for a room', () => {
            const description = item.getDescription('room');
            expect(description).toBe('There is a shiny brass lantern nearby. It is dark and cold.');
        });

        it('should return the description and the current state for the inventory', () => {
            const description = item.getDescription('inventory');
            expect(description).toBe('Brass lantern (unlit)');
        });

        it('should return the description and the current state for a room', () => {
            const description = item.getDescription('look');
            expect(description).toBe("It's a shiny brass lantern, which runs on oil. It looks like it could be lit.");
        });
    });

    describe('Getting a contextual description for the lamp with lit state', () => {
        const item = new Item('lantern', { ...defaultItemOptions, initialState: 'lit' });

        it('should return the description and the current state for a room', () => {
            const description = item.getDescription('room');
            expect(description).toBe(
                'There is a shiny brass lantern nearby. It shines brightly, illuminating the surroundings.',
            );
        });

        it('should return the description and the current state for the inventory', () => {
            const description = item.getDescription('inventory');
            expect(description).toBe('Brass lantern (lit)');
        });

        it('should return the description and the current state for a room', () => {
            const description = item.getDescription('look');
            expect(description).toBe("It's a shiny brass lantern, which runs on oil. The flame dances steadily.");
        });
    });
});
