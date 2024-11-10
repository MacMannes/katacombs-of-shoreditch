import { Connection, ConnectionOptions, Direction, Item } from '@katas/katacombs/domain';

export class Room {
    private readonly connections: Connection[] = [];
    private items: Item[] = [];

    constructor(
        public readonly name: string,
        public readonly title: string,
        public readonly description: string,
    ) {}

    public getConnections(): Connection[] {
        return [...this.connections];
    }

    public addConnection(direction: Direction, to: Room, options?: ConnectionOptions) {
        this.connections.push(new Connection(direction, to.name, options));
    }

    public findConnection(direction: string, fromRoomName?: string): Connection | undefined {
        return this.connections.find((it) => it.matches(direction, fromRoomName));
    }

    public getItems(): Item[] {
        return [...this.items];
    }

    public addItem(item: Item) {
        this.items.push(item);
    }

    public findItem(name: string): Item | undefined {
        return this.items.find((item) => item.matches(name));
    }

    public removeItem(item: Item) {
        this.items = this.items.filter((it) => it.name !== item.name);
    }
}
