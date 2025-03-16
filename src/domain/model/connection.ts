import { isDirection, type Direction } from 'src/domain/model/direction.ts';

export class Connection {
    public readonly description?: string;
    private readonly words: string[] = [];

    constructor(
        readonly direction: Direction,
        readonly roomName: string,
        options?: ConnectionOptions,
    ) {
        this.description = options?.description;
        if (options?.words) this.words.push(...options.words);
    }

    public matches(direction: string, roomName?: string): boolean {
        return this.matchesDirection(direction) && this.matchesRoom(roomName);
    }

    public matchesDirection(direction: string): boolean {
        return isDirection(direction)
            ? this.direction === direction
            : this.words.includes(direction);
    }

    public matchesRoom(roomName?: string): boolean {
        if (!roomName) return true;

        return this.roomName === roomName;
    }
}

export type ConnectionOptions = {
    description?: string;
    words?: string[];
};
