import { beforeEach, describe, expect, it } from 'vitest';
import { Game, ItemRepository, Room, RoomRepository } from '@katas/katacombs/domain';

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
            game = new Game(roomRepository, new ItemRepository());
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
});
