import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createTestRooms,
    Game,
    GameController,
    ItemRepository,
    NoOpUserInterface,
    RoomRepository,
    UserInterface,
} from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';

describe('GameController', () => {
    let ui: UserInterface;
    let controller: GameController;

    function createGameController() {
        ui = createMockedObject(NoOpUserInterface);

        const testRooms = createTestRooms();
        const roomRepository = new RoomRepository(testRooms);
        const itemRepository = new ItemRepository();
        const game = new Game(roomRepository, itemRepository);
        controller = new GameController(game, ui);
    }

    beforeEach(() => {
        createGameController();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Starting the game', () => {
        it('should print the title and description of the starting room', () => {
            controller.startGame();
            expect(ui.displayRoom).toHaveBeenCalledTimes(1);
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });
    });

    describe('Processing commands', () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "What?" when the command could not be interpreted', () => {
            controller.processCommand('print', 'invoice');
            expect(ui.displayMessage).toBeCalledWith('What?');
        });

        it('should not say "What?" when command "look" was given', () => {
            controller.processCommand('look');
            expect(ui.displayMessage).not.toBeCalledWith('What?');
        });

        it('should display the current room when command "look" was given', () => {
            controller.processCommand('look');
            expect(ui.displayRoom).toHaveBeenCalledTimes(1);
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should allow for commands with only a verb', () => {
            controller.processCommand('relax');
            expect(ui.displayMessage).toBeCalledWith('What?');
        });

        it('should allow for commands with a verb and a subject', () => {
            controller.processCommand('look', 'NORTH');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
            );
        });
    });

    describe('Traveling', () => {
        describe('to an ordinal direction', () => {
            it('should print the new room when the direction is valid', () => {
                controller.go('NORTH');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when direction is invalid', () => {
                controller.go('WEST');
                expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('no way'));
            });

            it('should print the current room when the direction is invalid', () => {
                controller.go('WEST');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
            });
        });

        describe('using synonyms of the connection', () => {
            it('should print the new room when traveling to a synonym of the connection was successful', () => {
                controller.go('building');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when synonym could not be found', () => {
                controller.go('left');
                expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('no way'));
            });
        });
    });

    describe('Looking around', () => {
        it('should show the description of the room when looking in no specific direction', () => {
            controller.look();

            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should show the description when looking in a specific direction with a connection', () => {
            controller.look('NORTH');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show something like "Nothing interesting" when looking in a specific direction with NO connection', () => {
            controller.look('WEST');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('Nothing interesting'));
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show "I see no ... here" when looking at something that is not here', () => {
            controller.look('keys');

            expect(ui.displayMessage).toHaveBeenCalledWith('I see no keys here.');
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });
    });

    describe('Looking at items', () => {
        it('should show the description of the item when found', () => {
            controller.go('NORTH');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            controller.look('keys');

            expect(ui.displayMessage).toHaveBeenCalledWith("It's a key ring with three rusty keys on it.");
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show the description of the item in the room when when looking at it using a synonym', () => {
            controller.go('NORTH');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            controller.look('lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith("It's a shiny brass lantern, which runs on oil.");
        });

        it('should show the description of the item in the inventory when when looking at it using a synonym', () => {
            controller.go('NORTH');
            controller.take('lantern');
            vi.resetAllMocks();

            controller.look('lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith("It's a shiny brass lantern, which runs on oil.");
        });
    });

    describe('Taking items', () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say "OK." when the item exists in the room', () => {
            controller.go('NORTH');
            controller.take('keys');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });

        it('should say something like can not find ..." when the item can not be found in the room', () => {
            controller.take('keys');

            expect(ui.displayMessage).toBeCalledWith("Can't find keys here.");
        });

        it('should move the item from the room to the inventory when it exists in the room', () => {
            controller.go('NORTH');
            expect(controller.getCurrentRoom().findItem('keys')).toBeDefined();
            controller.take('keys');

            expect(controller.getCurrentRoom().findItem('keys')).toBeUndefined();
            expect(controller.getInventory().find((item) => item.matches('keys'))).toBeDefined();
        });

        it('should say "OK." when taking an item using a synonym', () => {
            controller.go('NORTH');
            controller.take('lamp');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });
    });

    describe('Dropping items', () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should move the item from inventory to the room when the user possesses the item', () => {
            controller.go('NORTH');
            controller.take('keys');
            controller.go('SOUTH');
            controller.drop('keys');

            expect(controller.getCurrentRoom().findItem('keys')).toBeDefined();
            expect(controller.getInventory().find((item) => item.matches('keys'))).toBeUndefined();
        });

        it('should say "OK" when the item is dropped', () => {
            controller.go('NORTH');
            controller.take('keys');
            controller.go('SOUTH');
            vi.resetAllMocks();
            controller.drop('keys');
            expect(ui.displayMessage).toBeCalledWith('OK.');
        });

        it('should say something like "You are not carrying it!" when the user does not possess the item', () => {
            controller.drop('keys');

            expect(ui.displayMessage).toBeCalledWith("You aren't carrying it!");
        });

        it('should say "OK." when dropping an item using a synonym', () => {
            controller.go('NORTH');
            controller.take('lantern');

            vi.resetAllMocks();
            controller.drop('light');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });
    });

    describe('Showing the inventory', () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should say something like "You are not carrying anything." when the user does not possess any items', () => {
            controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith("You're not carrying anything.");
            expect(ui.displayMessage).toHaveBeenCalledTimes(1);
        });

        it('should print all the items the user has in their possession', () => {
            controller.displayInventory();
            controller.go('NORTH');
            controller.take('keys');
            controller.take('lantern');
            vi.resetAllMocks();

            controller.displayInventory();

            expect(ui.displayMessage).toBeCalledWith(
                expect.stringContaining('You are currently holding the following:'),
            );
            expect(ui.displayMessage).toBeCalledWith(expect.stringContaining('Brass lantern'));
            expect(ui.displayMessage).toBeCalledWith(expect.stringContaining('Set of keys'));
            expect(ui.displayMessage).toBeCalledTimes(1);
        });
    });
});
