import { describe, expect, it } from 'vitest';
import { Item } from '@katas/katacombs/domain';

describe('Item', () => {
    describe('Creating a new item', () => {
        it('should set the current state to the first given state, when no initial state was given', () => {
            const item = new Item('lantern', {
                description: {
                    inventory: 'Brass lantern',
                    room: 'There is a shiny brass lantern nearby.',
                    look: "It's a shiny brass lantern, which runs on oil.",
                },
                states: ['lit', 'unlit'],
            });

            expect(item.getCurrentState()).toBe('lit');
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

            expect(item.getCurrentState()).toBe('unlit');
        });
    });

    describe('Getting a contextual description', () => {
        const item = new Item('lantern', {
            description: {
                inventory: 'Brass lantern',
                room: 'There is a shiny brass lantern nearby.',
                look: "It's a shiny brass lantern, which runs on oil.",
            },
        });

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
