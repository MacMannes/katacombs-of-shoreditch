import { beforeEach, describe, expect, it } from 'vitest';
import { Game, ItemRepository, Room, RoomRepository } from '@katas/katacombs/domain';

describe('Game', () => {
    describe('Move to a new room', () => {
        const start = new Room('start', 'Room 1', '');
        const room2 = new Room('room2', 'Room 2', '');
        start.addConnection('south', 'room2');
        room2.addConnection('north', 'start');
        let game: Game;

        beforeEach(() => {
            const roomRepository = new RoomRepository([start, room2]);
            game = new Game(roomRepository, new ItemRepository());
        });

        it('should return the new room, if the move was successful', () => {
            const result = game.go('south');
            expect(result).toBe(room2);
        });

        it('should set add the visit to the start room when the game is started', () => {
            expect(room2.getNumberOfVisits()).toBe(1);
        });

        it('should set the current room to the new room, if the move was successful', () => {
            game.go('south');
            expect(game.getCurrentRoom()).toBe(room2);
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
