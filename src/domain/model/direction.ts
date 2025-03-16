const directionValues = [
    'north',
    'east',
    'south',
    'west',
    'up',
    'down',
] as const;

// Define `Direction` as a union of the values in `directionValues`
export type Direction = (typeof directionValues)[number];

export function isDirection(value: unknown): value is Direction {
    return directionValues.includes(value as Direction);
}

export function oppositeOf(direction: Direction): Direction {
    const opposites: Record<Direction, Direction> = {
        north: 'south',
        east: 'west',
        south: 'north',
        west: 'east',
        up: 'down',
        down: 'up',
    };

    return opposites[direction];
}
