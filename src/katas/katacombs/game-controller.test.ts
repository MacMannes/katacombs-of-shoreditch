import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestRooms, Game, ItemRepository, RoomRepository } from '@katas/katacombs/domain';
import { createMockedObject } from '@utils/test';
import { NoOpUserInterface, UserInterface } from '@katas/katacombs/ui';
import { GameController } from '@katas/katacombs';

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

    describe('Quitting the game', () => {
        beforeEach(() => {
            createGameController();
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should call process.exit() when the game is quit', () => {
            expect(() => {
                controller.quitGame();
            }).toThrow('process.exit unexpectedly called with "0"');
        });

        it('should process the "quit" commando', () => {
            expect(() => {
                controller.processCommand('quit');
            }).toThrow('process.exit unexpectedly called with "0"');
        });

        it('should say "Bye!', () => {
            expect(() => {
                controller.processCommand('quit');
            }).toThrow();

            expect(ui.displayMessage).toBeCalledWith('Bye!');
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

        it('should say "What?" when an invalid commans with only a verb was given', () => {
            controller.processCommand('relax');
            expect(ui.displayMessage).toBeCalledWith('What?');
        });

        it('should not say "What?" when command "look" was given without a target', () => {
            controller.processCommand('look');
            expect(ui.displayMessage).not.toBeCalledWith('What?');
        });

        it('should display the current room when command "look" was given without a target', () => {
            controller.processCommand('look');
            expect(ui.displayRoom).toHaveBeenCalledTimes(1);
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should process look commands with a target', () => {
            controller.processCommand('look', 'north');
            expect(ui.displayMessage).toHaveBeenCalledWith(
                'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
            );
        });

        it('should say "What?" when the go command was given without a direction', () => {
            controller.processCommand('go');
            expect(ui.displayMessage).toBeCalledWith('What?');
        });

        it('should process the go command when a direction was given', () => {
            controller.processCommand('go', 'building');
            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
        });

        it('should process the take command', () => {
            controller.processCommand('take', 'watch');
            expect(ui.displayMessage).toBeCalledWith("Can't find watch here.");
        });

        it('should say "What?" when the take command was given without a target', () => {
            controller.processCommand('take');
            expect(ui.displayMessage).toBeCalledWith('What?');
        });

        it('should process the drop command', () => {
            controller.processCommand('drop', 'watch');
            expect(ui.displayMessage).toBeCalledWith("You aren't carrying it!");
        });

        it('should say "What?" when the drop command was given without a target', () => {
            controller.processCommand('drop');
            expect(ui.displayMessage).toBeCalledWith('What?');
        });
    });

    describe('Traveling', () => {
        describe('to an ordinal direction', () => {
            it('should print the new room when the direction is valid', () => {
                controller.processCommand('go', 'north');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when direction is invalid', () => {
                controller.processCommand('go', 'west');
                expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('no way'));
            });

            it('should print the current room when the direction is invalid', () => {
                controller.processCommand('go', 'west');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
            });
        });

        describe('using synonyms of the connection', () => {
            it('should print the new room when traveling to a synonym of the connection was successful', () => {
                controller.processCommand('go', 'building');
                expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'building' }));
            });

            it('should print a message when synonym could not be found', () => {
                controller.processCommand('go', 'left');
                expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('no way'));
            });
        });
    });

    describe('Looking around', () => {
        it('should show the description of the room when looking in no specific direction', () => {
            controller.processCommand('look');

            expect(ui.displayRoom).toHaveBeenCalledWith(expect.objectContaining({ name: 'start' }));
        });

        it('should show the description when looking in a specific direction with a connection', () => {
            controller.processCommand('look', 'north');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show the description when looking at one of the synonyms of a connection', () => {
            controller.processCommand('look', 'building');

            expect(ui.displayMessage).toHaveBeenCalledWith(
                'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
            );
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show something like "Nothing interesting" when looking in a specific direction with NO connection', () => {
            controller.processCommand('look', 'west');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('Nothing interesting'));
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show something like "Nothing interesting" when looking at a connection with no description', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks();

            controller.processCommand('look', 'outside');

            expect(ui.displayMessage).toHaveBeenCalledWith(expect.stringContaining('Nothing interesting'));
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });
    });

    describe('Looking at items', () => {
        it('should show the description of the item when found', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            controller.processCommand('look', 'keys');

            expect(ui.displayMessage).toHaveBeenCalledWith("It's a key ring with three rusty keys on it.");
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show the description of the item in the room when when looking at it using a synonym', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks(); // Reset mocks, because we only wat to check the ui mock for the look command

            controller.processCommand('look', 'lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith("It's a shiny brass lantern, which runs on oil.");
        });

        it('should show the description of the item in the inventory when when looking at it using a synonym', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lantern');
            vi.resetAllMocks();

            controller.processCommand('look', 'lamp');

            expect(ui.displayMessage).toHaveBeenCalledWith("It's a shiny brass lantern, which runs on oil.");
        });

        it('should show "I see no ... here" when looking at something that is not here', () => {
            controller.processCommand('look', 'keys');

            expect(ui.displayMessage).toHaveBeenCalledWith('I see no keys here.');
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
        });

        it('should show "I see no ... here" when looking at something that is not visible', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks();

            controller.processCommand('look', 'key');

            expect(ui.displayMessage).toHaveBeenCalledWith('I see no key here.');
            expect(ui.displayRoom).toHaveBeenCalledTimes(0);
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
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'keys');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });

        it('should say something like can not find ..." when the item can not be found in the room', () => {
            controller.processCommand('take', 'keys');

            expect(ui.displayMessage).toBeCalledWith("Can't find keys here.");
        });

        it('should say something like can not find ..." when the item in the room is invisible', () => {
            controller.processCommand('go', 'north');
            vi.resetAllMocks();

            controller.processCommand('take', 'coin');

            expect(ui.displayMessage).toBeCalledWith("Can't find coin here.");
        });

        it('should move the item from the room to the inventory when it exists in the room', () => {
            controller.processCommand('go', 'north');
            expect(controller.getCurrentRoom().findItem('keys')).toBeDefined();
            controller.processCommand('take', 'keys');

            expect(controller.getCurrentRoom().findItem('keys')).toBeUndefined();
            expect(controller.getInventory().find((item) => item.matches('keys'))).toBeDefined();
        });

        it('should say "OK." when taking an item using a synonym', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lamp');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });

        it('should not allow immovable objects to be taken', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'desk');

            const items = controller.getInventory().map((item) => item.name);
            expect(items).not.toContain('desk');
        });

        it('should say "You can`t be serious!" when trying to take an immovable object', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'desk');

            expect(ui.displayMessage).toBeCalledWith(expect.stringContaining("You can't be serious!"));
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
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'keys');
            controller.processCommand('go', 'south');
            controller.processCommand('drop', 'keys');

            expect(controller.getCurrentRoom().findItem('keys')).toBeDefined();
            expect(controller.getInventory().find((item) => item.matches('keys'))).toBeUndefined();
        });

        it('should say "OK" when the item is dropped', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'keys');
            controller.processCommand('go', 'south');
            vi.resetAllMocks();

            controller.processCommand('drop', 'keys');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });

        it('should say something like "You are not carrying it!" when the user does not possess the item', () => {
            controller.processCommand('drop', 'keys');

            expect(ui.displayMessage).toBeCalledWith("You aren't carrying it!");
        });

        it('should say "OK." when dropping an item using a synonym', () => {
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lantern');

            vi.resetAllMocks();
            controller.processCommand('drop', 'light');

            expect(ui.displayMessage).toBeCalledWith('OK.');
        });
    });

    describe('Changing the state of items', () => {
        beforeEach(() => {
            createGameController();
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'lantern');
        });

        afterEach(() => {
            vi.resetAllMocks();
        });

        it('should show the initial state of the lamp', () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('should set the lamp to lit with the command "light lamp"', () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            controller.processCommand('light', 'lamp');

            expect(lamp?.getCurrentState()).toBe('lit');
        });

        it('should not say "What?" after giving the command "light lamp"', () => {
            controller.processCommand('light', 'lamp');
            expect(ui.displayMessage).not.toBeCalledWith('What?');
        });

        it('should set the lamp to lit with the command "extinguish lamp"', () => {
            const lamp = controller.findItem('lamp');
            expect(lamp?.getCurrentState()).toBe('unlit'); // Verify initial state

            controller.processCommand('light', 'lamp');
            expect(lamp?.getCurrentState()).toBe('lit');

            controller.processCommand('extinguish', 'lamp');

            expect(lamp?.getCurrentState()).toBe('unlit');
        });

        it('The player should not be allowed to trigger internal commands like "changeState lamp"', () => {
            vi.resetAllMocks();
            controller.processCommand('changeState', 'lamp');

            expect(ui.displayMessage).toBeCalledWith('What?');
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

        it('should print all the visible items the user has in their possession', () => {
            controller.displayInventory();
            controller.processCommand('go', 'north');
            controller.processCommand('take', 'keys');
            controller.processCommand('take', 'lantern');
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
