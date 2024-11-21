import { beforeEach, describe, expect, it } from 'vitest';
import { Item, Room } from '@katas/katacombs/domain';

describe('Room', () => {
    let room: Room;

    beforeEach(() => {
        room = new Room(
            'building',
            'Inside the building',
            'You are inside the main room of the Truman Brewery. There is a strong smell of hops and a dozen empty casks',
        );
        room.addItem(
            new Item('key', {
                description: {
                    inventory: 'A rusty key',
                    room: "There's rusty key on the ground here.",
                    look: "It's a very rusty key. You wonder if it's still usable'",
                },
                visible: false,
            }),
        );
        room.addItem(
            new Item('lantern', {
                description: {
                    inventory: 'Brass lantern',
                    room: 'There is a shiny brass lantern nearby.',
                    look: "It's a shiny brass lantern, which runs on oil.",
                },
            }),
        );
    });

    describe('Getting items', () => {
        it('should not return invisible items by default', () => {
            const items = room.getItems();
            expect(items).toHaveLength(1);
            expect(items[0].name).toBe('lantern');
        });

        it('should also return invisible items when explicitly allowing invisible items', () => {
            const items = room.getItems(true);
            expect(items).toHaveLength(2);
        });
    });

    describe('Finding an item', () => {
        it('Finding an item should not return a hidden item by default', () => {
            const item = room.findItem('key');
            expect(item).toBeUndefined();
        });

        it('Finding an item should return a hidden item when explicitly allowing invisible items', () => {
            const item = room.findItem('key', true);
            expect(item).toBeDefined();
        });
    });
});
