import { describe, expect, it } from 'vitest';
import { Room, RoomRepository } from '@katas/katacombs/domain';

describe('RoomRepository', () => {
    describe('Create new Repository', () => {
        it('should not allow two rooms with the same name', () => {
            const room = new Room('start', '', '');
            expect(() => new RoomRepository([room, room])).toThrowError();
        });

        it('should not allow two rooms with the same title', () => {
            const rooms = [new Room('room1', 'Room', ''), new Room('room2', 'Room', '')];
            expect(() => new RoomRepository(rooms)).toThrowError();
        });

        it('should not allow non-traversable connections to rooms', () => {
            const room1 = new Room('start', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');
            room1.addConnection('north', room2);

            const rooms = [room1, room2];
            expect(() => new RoomRepository(rooms)).toThrowError('The connection from start to room2 is not reversed.');
        });

        it('should not fail when all connections are reversed', () => {
            const room1 = new Room('start', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');
            room1.addConnection('south', room2);
            room2.addConnection('north', room1);

            const rooms = [room1, room2];
            expect(() => new RoomRepository(rooms)).not.toThrowError();
        });

        it('should validate if a room with the name start exists', () => {
            const room1 = new Room('room1', 'Room 1', '');
            const room2 = new Room('room2', 'Room 2', '');

            const rooms = [room1, room2];
            expect(() => new RoomRepository(rooms)).toThrowError('A room with the name "start" does not exist.');
        });
    });
});
