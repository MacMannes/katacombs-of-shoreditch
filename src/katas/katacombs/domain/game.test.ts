import { beforeEach, describe, expect, it } from 'vitest';
import { connectRooms, Game, NoOpUserInterface, Room, UserInterface } from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';

describe('Game', () => {
    const rooms = createRooms();
    let ui: UserInterface;
    let game: Game;

    beforeEach(() => {
        ui = createMockedObject(NoOpUserInterface);
        game = new Game(ui, rooms);
    });

    describe('constructor', () => {
        it('should not allow two rooms with the same name', () => {
            const room = new Room('start', '', '');
            expect(() => new Game(ui, [room, room])).toThrowError();
        });

        it('should not allow two rooms with the same title', () => {
            const rooms = [new Room('room1', 'Room', ''), new Room('room2', 'Room', '')];
            expect(() => new Game(ui, rooms)).toThrowError();
        });

        it('should not allow connections to rooms that does not exist', () => {
            const room1 = new Room('start', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');
            room1.addConnection('NORTH', 'room3');

            const rooms = [room1, room2];
            expect(() => new Game(ui, rooms)).toThrowError(
                'Invalid connection from start to room3. Room room3 does not exist.',
            );
        });

        it('should not allow non-traversable connections to rooms', () => {
            const room1 = new Room('start', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');
            room1.addConnection('NORTH', room2.name);

            const rooms = [room1, room2];
            expect(() => new Game(ui, rooms)).toThrowError('The connection from start to room2 is not reversed.');
        });

        it('should not fail when all connections are reversed', () => {
            const room1 = new Room('start', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');
            connectRooms(room1, room2, 'SOUTH');

            const rooms = [room1, room2];
            expect(() => new Game(ui, rooms)).not.toThrowError();
        });

        it('should validate if a room with the name start exists', () => {
            const room1 = new Room('room1', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');

            const rooms = [room1, room2];
            expect(() => new Game(ui, rooms)).toThrowError('A room with the name "start" does not exist.');
        });
    });

    describe('start', () => {
        it('should print the title and description of the starting room', () => {
            game.start();
            expect(ui.displayRoom).toHaveBeenCalledTimes(1);
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });
    });
});

function createRooms(): Room[] {
    const start = new Room(
        'start',
        'Lost in Shoreditch',
        'You are standing at the end of a brick lane before a small brick building called "The Old Truman Brewery".' +
            'Around you is a forest of restaurants and bars. A small stream of crafted beer flows out of the building and down a gully.',
    );
    const building = new Room(
        'building',
        'Inside the building',
        'Inside the building' +
            'you are inside the main room of the truman brewery. there is a strong smell of hops and a dozen empty casks',
    );
    connectRooms(start, building, 'NORTH');

    const nowhere = new Room('nowhere', 'Nowhere', "You're on the road to Nowhere");

    return [nowhere, start, building];
}
