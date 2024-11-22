import { Item, Room } from '@katas/katacombs/domain';

export function createTestRooms(): Room[] {
    const start = new Room(
        'start',
        'Lost in Shoreditch',
        'You are standing at the end of a brick lane before a small brick building called "The Old Truman Brewery". ' +
            'Around you is a forest of restaurants and bars. A small stream of crafted beer flows out of the building and down a gully.',
    );
    const building = new Room(
        'building',
        'Inside the building',
        'You are inside the main room of the Truman Brewery. There is a strong smell of hops and a dozen empty casks.',
    );
    start.addConnection('north', building, {
        description: 'I see a brick building with a sign saying "Truman Brewery and a wooden white door".',
        words: ['building', 'inside'],
    });
    building.addConnection('south', start, {
        words: ['outside', 'door'],
    });
    building.addItem(
        new Item('keys', {
            description: {
                inventory: 'Set of keys',
                room: 'There are some keys on the ground here.',
                look: "It's a key ring with three rusty keys on it.",
            },
        }),
    );
    building.addItem(
        new Item('coin', {
            description: {
                inventory: 'A coin',
                room: "There's a coin here.",
                look: "It's an old coin. You wonder if you can still buy something with it'",
            },
            visible: false,
        }),
    );
    building.addItem(
        new Item('lantern', {
            description: {
                inventory: 'Brass lantern',
                room: 'There is a shiny brass lantern nearby.',
                look: "It's a shiny brass lantern, which runs on oil.",
            },
            words: ['light', 'lamp'],
            states: {
                lit: {
                    room: 'It shines brightly, illuminating the surroundings.',
                    inventory: 'The flame dances steadily.',
                    look: 'The flame dances steadily.',
                },
                unlit: {
                    room: 'It is dark and cold.',
                    inventory: '',
                    look: 'It looks like it could be lit.',
                },
            },
            initialState: 'unlit',
            triggers: [
                {
                    verb: 'light',
                    actions: [
                        {
                            command: 'changeState',
                            argument: 'lamp',
                            parameter: 'lit',
                            responses: {
                                success:
                                    'The lamp sputters for a moment, as if clearing its throat, then bursts into a steady flame. It seems proud of itself.',
                                failure: "The lamp is already shining brightly! Trying to overachieve, aren't we?",
                            },
                        },
                    ],
                },
                {
                    verb: 'extinguish',
                    actions: [
                        {
                            command: 'changeState',
                            argument: 'lamp',
                            parameter: 'unlit',
                            responses: {
                                success:
                                    'As you extinguish the lamp, it lets out a final flicker, as if saying, "But I was just getting started!"',
                                failure:
                                    'An epic battle ensues between you and... wait, no. The lamp is already off. Victory without lifting a finger.',
                            },
                        },
                    ],
                },
                {
                    verb: 'rub',
                    actions: [
                        {
                            command: 'speak',
                            argument:
                                'You rub the lamp. Nothing happens. Maybe it’s out of genies, or maybe you’re just not their type.',
                        },
                    ],
                },
                {
                    verb: 'kick',
                    actions: [
                        {
                            command: 'speak',
                            argument:
                                'You kick the lamp. It wobbles dangerously, then tips over and lands on your foot. Well played, lamp.',
                        },
                    ],
                },
                {
                    verb: 'talk',
                    actions: [
                        {
                            command: 'speak',
                            argument:
                                'You say a few kind words to the lamp. It doesn’t say anything back, but it seems to shine a little brighter. How sweet.',
                        },
                    ],
                },
                {
                    verb: 'eat',
                    actions: [
                        {
                            command: 'speak',
                            argument: 'You nibble at the lamp. It’s oily, crunchy, and incredibly bad for your teeth.',
                        },
                    ],
                },
                {
                    verb: 'push',
                    actions: [
                        {
                            command: 'speak',
                            argument:
                                'You push the object. It wobbles, then stays exactly where it was. Maybe you should push your luck instead.',
                        },
                    ],
                },
                {
                    verb: 'touch',
                    actions: [
                        {
                            command: 'speak',
                            argument:
                                'You touch the lamp. It’s oddly smooth and slightly sticky. You immediately regret your curiosity.',
                        },
                    ],
                },
            ],
        }),
    );
    building.addItem(
        new Item('desk', {
            description: {
                inventory: '*desk',
                room: 'In one corner of the room you see an old desk.',
                look: "You look at the desk. It's covered in papers, pens, and existential dread.",
            },
            immovable: true,
        }),
    );

    const nowhere = new Room('nowhere', 'Nowhere', "You're on the road to Nowhere");

    return [nowhere, start, building];
}
