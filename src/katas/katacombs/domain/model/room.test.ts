import { beforeEach, describe, expect, it } from 'vitest';
import { Item, Room } from '@katas/katacombs/domain';

describe('Room', () => {
    let room: Room;

    beforeEach(() => {
        room = new Room(
            'building',
            'Inside the building',
            'Inside the building' +
                'Uou are inside the main room of the Truman Brewery. There is a strong smell of hops and a dozen empty casks',
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

    it('Getting items should not return invisible items by default', () => {
        const items = room.getItems();
        expect(items).toHaveLength(1);
        expect(items[0].name).toBe('lantern');
    });

    it('Getting items should also return invisible items when includeHiddenItems==true', () => {
        const items = room.getItems(true);
        expect(items).toHaveLength(2);
    });
});
