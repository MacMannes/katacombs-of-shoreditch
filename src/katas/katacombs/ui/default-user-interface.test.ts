import { afterEach, describe, expect, it, vi } from 'vitest';
import { DefaultUserInterface } from '@katas/katacombs/ui';
import { createTestRooms } from '@katas/katacombs/domain';

describe('Default UserInterface', () => {
    const ui = new DefaultUserInterface();
    const rooms = createTestRooms();

    const consoleSpy = vi.spyOn(console, 'log');

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('displayRoom', () => {
        it('Should print the description of the room', () => {
            const startRoom = rooms.find((room) => room.name === 'start');
            if (!startRoom) throw new Error('Start room not found');

            ui.displayRoom(startRoom);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('You are standing at the end of a brick lane'),
            );
        });

        it('Should print the items in the room', () => {
            const building = rooms.find((room) => room.name === 'building');
            if (!building) throw new Error('Building room not found');

            ui.displayRoom(building);

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('keys'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('lantern'));
        });

        it('Should print the immovable items in the room without a leading newline', () => {
            const building = rooms.find((room) => room.name === 'building');
            if (!building) throw new Error('Building room not found');

            ui.displayRoom(building);

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('strong smell'));
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('In one corner of the room you see an old desk.'),
            );
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('\nThere is a strong smell'));
            expect(consoleSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('\nIn one corner of the room you see an old desk.'),
            );
        });
    });

    describe('displayMessage', () => {
        it('Should print provided message', () => {
            ui.displayMessage('Hello World!');

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Hello World!'));
        });
    });
});
