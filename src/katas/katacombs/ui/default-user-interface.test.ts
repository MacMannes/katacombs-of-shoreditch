import { afterEach, describe, expect, it, vi } from 'vitest';
import { DefaultUserInterface } from '@katas/katacombs/ui';
import { createTestRooms } from '@katas/katacombs/domain';

describe('Default UserInterface', () => {
    const ui = new DefaultUserInterface();
    const rooms = createTestRooms();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    afterEach(() => {
        vi.clearAllMocks;
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
    });

    describe('displayMessage', () => {
        it('Should print provided message', () => {
            ui.displayMessage('Hello World!');

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Hello World!'));
        });
    });
});
