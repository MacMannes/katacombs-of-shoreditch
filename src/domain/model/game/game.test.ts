import { beforeEach, describe, expect, it } from 'vitest';
import { Game, Item, ItemRepository, Room, RoomRepository, TextRepository } from 'src/domain';

describe('Game', () => {
    describe('describeRoom', () => {
        let room: Room;
        let roomRepository: RoomRepository;
        let textRepository: TextRepository;
        let game: Game;

        beforeEach(() => {
            room = createRoom();
            roomRepository = new RoomRepository([room]);
            textRepository = createTextRepository();
            game = new Game(roomRepository, new ItemRepository(), textRepository);
        });

        it('should Concatenate the full room description as expected', () => {
            const result = game.describeRoom();
            expect(result.text).toBe(
                "You are inside the building. There is a desk in the middle of the room.\n\nThere's a key on the desk.\n\nThere is a lantern on the floor. It is unlit.",
            );
        });

        it('should return the expected audio keys', () => {
            const result = game.describeRoom();
            expect(result.audioFiles).toStrictEqual([
                'room-building',
                'item-desk-room',
                'item-key-room',
                'item-lantern-room',
                'item-lantern-room-unlit',
            ]);
        });

        it('should only return the audio keys for movable items, when the room has been visited before', () => {
            room.addVisit();
            room.addVisit();

            const result = game.describeRoom();
            expect(result.audioFiles).toStrictEqual([
                'room-building-short',
                'item-key-room',
                'item-lantern-room',
                'item-lantern-room-unlit',
            ]);
        });
    });
});

function createRoom(): Room {
    const room = new Room('start', 'Inside the building', 'room-building', 'room-building-short');
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
