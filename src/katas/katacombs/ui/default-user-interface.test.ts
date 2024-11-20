import { afterEach, describe, expect, it, vi } from 'vitest';
import { DefaultUserInterface } from '@katas/katacombs/ui';
import { createTestRooms } from '@katas/katacombs/domain';

describe('Default UserInterface', () => {
    const ui = new DefaultUserInterface();
    const rooms = createTestRooms();
    const startRoom = rooms.find((room) => room.name === 'start');
    if (!startRoom) throw new Error('Start room not found');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    afterEach(() => {
        vi.clearAllMocks;
    });

    describe('displayRoom', () => {
        it('Should print the description of the room', () => {
            ui.displayRoom(startRoom);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('You are standing at the end of a brick lane'),
            );
        });
    });
});
