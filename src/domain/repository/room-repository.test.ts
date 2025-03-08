import { describe, expect, it } from 'vitest';
import { Item, Room, RoomRepository } from '../index';

describe('RoomRepository', () => {
    describe('Create new Repository', () => {
        describe('Room Validation', () => {
            it('should not allow two rooms with the same name', () => {
                const room = new Room('start', '', '');
                expect(() => new RoomRepository([room, room])).toThrowError();
            });

            it('should not allow two rooms with the same title', () => {
                const rooms = [new Room('room1', 'Room', ''), new Room('room2', 'Room', '')];
                expect(() => new RoomRepository(rooms)).toThrowError();
            });

            it('should validate if a room with the name start exists', () => {
                const room1 = new Room('room1', 'Room 1', '');
                const room2 = new Room('room2', 'Room 2', '');

                const rooms = [room1, room2];
                expect(() => new RoomRepository(rooms)).toThrowError('A room with the name "start" does not exist.');
            });
        });

        describe('Connection Validation', () => {
            it('should not allow non-traversable connections to rooms', () => {
                const room1 = new Room('start', 'Room 1', '');
                const room2 = new Room('room2', 'Room 2', '');
                room1.createConnectionInDirection('north', 'room2');

                const rooms = [room1, room2];
                expect(() => new RoomRepository(rooms)).toThrowError(
                    'The connection from start to room2 is not reversed.',
                );
            });

            it('should not allow connections to rooms that does not exist', () => {
                const room1 = new Room('start', 'Room 1', '');
                const room2 = new Room('room2', 'Room 2', '');
                room1.createConnectionInDirection('north', 'room3');

                const rooms = [room1, room2];
                expect(() => new RoomRepository(rooms)).toThrowError(
                    'Invalid connection from start to room3. Room room3 does not exist.',
                );
            });

            it('should not fail when all connections are reversed', () => {
                const room1 = new Room('start', 'Room 1', '');
                const room2 = new Room('room2', 'Room 2', '');
                room1.createConnectionInDirection('south', 'room2');
                room2.createConnectionInDirection('north', 'start');

                const rooms = [room1, room2];
                expect(() => new RoomRepository(rooms)).not.toThrowError();
            });
        });

        describe('Item Validation', () => {
            it('should not allow two items with the same name', () => {
                const room1 = new Room('start', 'Room 1', '');
                const room2 = new Room('room2', 'Room 2', '');
                room1.addItem(
                    new Item('stapler', {
                        description: {
                            inventory: 'A Stapler',
                            room: 'There is a stapler on the table',
                            look: 'It is an ordinary stapler.',
                        },
                    }),
                );
                room2.addItem(
                    new Item('stapler', {
                        description: {
                            inventory: 'An old Stapler',
                            room: 'There is an antique stapler on the table',
                            look: 'It is a very old stapler.',
                        },
                    }),
                );
                const rooms = [room1, room2];
                expect(() => new RoomRepository(rooms)).toThrowError('Items should have unique names');
            });

            it('should not allow two items with the inventory description', () => {
                const room1 = new Room('start', 'Room 1', '');
                const room2 = new Room('room2', 'Room 2', '');
                room1.addItem(
                    new Item('stapler', {
                        description: {
                            inventory: 'A Stapler',
                            room: 'There is a stapler on the table',
                            look: 'It is an ordinary stapler.',
                        },
                    }),
                );
                room2.addItem(
                    new Item('old-stapler', {
                        description: {
                            inventory: 'A Stapler',
                            room: 'There is an antique stapler on the table',
                            look: 'It is a very old stapler.',
                        },
                    }),
                );
                const rooms = [room1, room2];
                expect(() => new RoomRepository(rooms)).toThrowError('Items should have unique inventory descriptions');
            });
        });
    });

    describe('Getting rooms', () => {
        it('should not throw an error when getting a room that does not exists', () => {
            const rooms = [new Room('start', 'Room', '')];
            const roomRepository = new RoomRepository(rooms);
            expect(() => roomRepository.getRoomByName('room2')).toThrowError();
        });
    });
});
