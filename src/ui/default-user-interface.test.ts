import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefaultAudioPlayer, DefaultUserInterface } from 'src/ui';
import { TextWithAudioFiles } from 'src/domain';
import { createMockedObject } from 'src/utils/test';

describe('Default UserInterface', async () => {
    const audioPlayer = createMockedObject(DefaultAudioPlayer);
    const ui = new DefaultUserInterface(audioPlayer);
    const consoleSpy = vi.spyOn(console, 'log');

    // let rooms: Room[];

    beforeEach(async () => {
        audioPlayer.play.mockResolvedValue();
        // rooms = await createTestRooms();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // TODO: Uncomment and fix the tests
    // describe('displayRoom', () => {
    //     it('should print the description of the room', () => {
    //         const startRoom = rooms.find((room) => room.name === 'start');
    //         if (!startRoom) throw new Error('Start room not found');
    //
    //         ui.displayRoom(startRoom);
    //
    //         expect(consoleSpy).toHaveBeenCalledWith(
    //             expect.stringContaining('You are standing at the end of a brick lane'),
    //         );
    //     });
    //
    //     it('should print the short description of the room when the user already visited it', () => {
    //         const startRoom = rooms.find((room) => room.name === 'start');
    //         if (!startRoom) throw new Error('Start room not found');
    //         startRoom.addVisit();
    //         startRoom.addVisit();
    //
    //         ui.displayRoom(startRoom);
    //
    //         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('You’re in front of'));
    //     });
    //
    //     it('should print the items in the room', async () => {
    //         const building = rooms.find((room) => room.name === 'building');
    //         if (!building) throw new Error('Building room not found');
    //
    //         await ui.displayRoom(building);
    //
    //         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('note'));
    //         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('lantern'));
    //     });
    //
    //     it('should print the immovable items in the room without a leading newline', async () => {
    //         const building = rooms.find((room) => room.name === 'building');
    //         if (!building) throw new Error('Building room not found');
    //
    //         await ui.displayRoom(building);
    //
    //         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('strong smell'));
    //         expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Tucked into the corner'));
    //         expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('\nThere is a strong smell'));
    //         expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('\nTucked into the corner'));
    //     });
    //
    //     it('should play the audioFile for the room', async () => {
    //         const building = rooms.find((room) => room.name === 'building');
    //         if (!building) throw new Error('Building room not found');
    //
    //         await ui.displayRoom(building);
    //         expect(audioPlayer.play).toHaveBeenCalledWith(
    //             'room-building',
    //             'item-casks-room',
    //             'item-desk-room',
    //             'item-rat-room',
    //             'item-note-room',
    //             'item-lantern-room',
    //             'item-lantern-room-unlit',
    //         );
    //     });
    // });

    describe('displayMessage', () => {
        it('should print provided message', () => {
            ui.displayMessage(new TextWithAudioFiles('Hello World!'));

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Hello World!'),
            );
        });

        it('should call the audio player when audioKeys were passed', async () => {
            ui.displayMessage(
                new TextWithAudioFiles('Hello World!', ['hello', 'world']),
            );
            expect(audioPlayer.play).toHaveBeenCalledWith('hello', 'world');
        });
    });
});
