import { beforeEach, describe, expect, it } from 'vitest';
import { Item } from 'src/domain/model/item/item.ts';
import { NPC } from 'src/domain/model/npc.ts';
import { Room } from 'src/domain/model/room/room.ts';

describe('Room', () => {
    let room: Room;

    beforeEach(() => {
        room = new Room(
            'building',
            'Inside the building',
            'You are inside the main room of the Truman Brewery. There is a strong smell of hops and a dozen empty casks',
            "You're inside the brewery",
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
        room.addNpcs([
            new NPC('shopkeeper', {
                description: {
                    room: 'The shopkeeper stands behind the counter.',
                    look: 'shopkeeper-look',
                },
                dialogs: [],
                greeting: '',
            }),
        ]);
    });

    describe('Getting the room description', () => {
        it('should return the short description when preferredType is "short"', () => {
            const description = room.getDescription('short');

            expect(description).toBe("You're inside the brewery");
        });

        it('should return the long description when preferredType is "short", ut there is no short description', () => {
            const room2 = new Room('room2', 'Title', 'Long description');
            const description = room2.getDescription('short');

            expect(description).toBe('Long description');
        });

        it('should return the long description when preferredType is "long"', () => {
            const description = room.getDescription('long');

            expect(description).toBe(
                'You are inside the main room of the Truman Brewery. There is a strong smell of hops and a dozen empty casks',
            );
        });

        it('should return the long description not asked for a preferred type and the room was not visited before', () => {
            const description = room.getDescription();

            expect(description).toBe(
                'You are inside the main room of the Truman Brewery. There is a strong smell of hops and a dozen empty casks',
            );
        });

        it('should return the short description when not asked for a preferred type and has visited the room before', () => {
            room.addVisit();
            room.addVisit();
            const description = room.getDescription();

            expect(description).toBe("You're inside the brewery");
        });
    });

    describe('Getting items', () => {
        it('should not return invisible items by default', () => {
            const items = room.getItems();
            expect(items).toHaveLength(1);
            expect(items[0]?.name).toBe('lantern');
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
