import { beforeEach, describe, expect, it } from 'vitest';
import { Game, Item, ItemRepository, Room, RoomRepository, TextRepository } from '@katas/katacombs/domain';

describe('Game', () => {
    describe('Move to a new room', () => {
        let start: Room;
        let room2: Room;
        let game: Game;

        beforeEach(() => {
            start = new Room('start', 'Room 1', '');
            room2 = new Room('room2', 'Room 2', '');
            start.addConnection('south', 'room2');
            room2.addConnection('north', 'start');
            const roomRepository = new RoomRepository([start, room2]);
            game = new Game(roomRepository, new ItemRepository(), new TextRepository({}));
        });

        it('should return the new room, if the move was successful', () => {
            const result = game.go('south');
            expect(result).toBe(room2);
        });

        it('should set add the visit to the start room when the game is started', () => {
            expect(start.getNumberOfVisits()).toBe(1);
        });

        it('should not have visited room2 when the game is started', () => {
            expect(room2.getNumberOfVisits()).toBe(0);
        });

        it('should set the current room to the new room, if the move was successful', () => {
            game.go('south');
            expect(game.getCurrentRoom()).toBe(room2);
        });

        it('should set the number of visits of room2 to 1 after visiting it for the first time', () => {
            game.go('south');
            expect(room2.getNumberOfVisits()).toBe(1);
        });

        it('should return undefined, if the move could not be made', () => {
            const result = game.go('north');
            expect(result).toBe(undefined);
        });

        it('should keep the current room, if the move could not be made', () => {
            game.go('north');
            expect(game.getCurrentRoom()).toBe(start);
        });
    });

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
