import { describe, expect, it } from 'vitest';
import { Item, Room, TextRepository } from '@katas/katacombs/domain';

describe('TextRepository', () => {
    describe('getText', () => {
        it('should return undefined when key was not found', () => {
            const repository = new TextRepository({});

            const text = repository.getText('key');
            expect(text).toBeUndefined();
        });

        it('should return the text when key was found', () => {
            const repository = new TextRepository({ hello: 'world' });

            const text = repository.getText('hello');
            expect(text).toBe('world');
        });
    });

    describe('describeRoom', () => {
        const room = createRoom();
        const repository = createTextRepository();

        it('should Concatenate the full room description as expected', () => {
            const result = repository.describeRoom(room);
            expect(result.text).toBe(
                "You are inside the building. There is a desk in the middle of the room.\n\nThere's a key on the desk.\n\nThere is a lantern on the floor. It is unlit.",
            );
        });

        it('should return the expected audio keys', () => {
            const result = repository.describeRoom(room);
            expect(result.audioFiles).toStrictEqual([
                'room-building',
                'item-desk-room',
                'item-key-room',
                'item-lantern-room',
                'item-lantern-room-unlit',
            ]);
        });
    });
});

function createRoom(): Room {
    const room = new Room('building', 'Inside the building', 'room-building', 'room-building-short');
    room.addItem(
        new Item('key', {
            description: {
                inventory: 'item-key-inventory',
                room: 'item-key-room',
                look: 'item-key-look',
            },
        }),
    );
    room.addItem(
        new Item('desk', {
            description: {
                inventory: 'item-desk-inventory',
                room: 'item-desk-room',
                look: 'item-desk-look',
            },
            immovable: true,
        }),
    );
    room.addItem(
        new Item('lantern', {
            description: {
                inventory: 'item-lantern-inventory',
                room: 'item-lantern-room',
                look: 'item-lantern-look',
            },
            states: {
                unlit: {
                    inventory: 'item-lantern-inventory-unlit',
                    room: 'item-lantern-room-unlit',
                    look: 'item-lantern-look-unlit',
                },
                lit: {
                    inventory: 'item-lantern-inventory-lit',
                    room: 'item-lantern-room-lit',
                    look: 'item-lantern-look-lit',
                },
            },
        }),
    );
    return room;
}

function createTextRepository() {
    return new TextRepository({
        'room-building': 'You are inside the building.',
        'room-building-short': "You're inside.",
        'item-key-room': "There's a key on the desk.",
        'item-desk-room': 'There is a desk in the middle of the room.',
        'item-lantern-room': 'There is a lantern on the floor.',
        'item-lantern-room-unlit': 'It is unlit.',
        'item-lantern-room-lit': 'It is lit.',
    });
}
