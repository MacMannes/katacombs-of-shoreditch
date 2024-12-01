import { Connection, ConnectionOptions, Direction, Item } from '@katas/katacombs/domain';

export class Room {
    private readonly connections: Connection[] = [];
    private items: Item[] = [];

    constructor(
        public readonly name: string,
        public readonly title: string,
        public readonly description: string,
        public readonly shortDescription?: string,
    ) {}

    public getConnections(): Connection[] {
        return this.connections;
    }

    public addConnection(direction: Direction, to: string, options?: ConnectionOptions) {
        this.connections.push(new Connection(direction, to, options));
    }

    public addConnections(connections: Connection[]) {
        this.connections.push(...connections);
    }

    public findConnection(direction: string, fromRoomName?: string): Connection | undefined {
        return this.connections.find((it) => it.matches(direction, fromRoomName));
    }

    public getItems(allowInvisibleItems = false): Item[] {
        return this.items.filter((item) => allowInvisibleItems || item.isVisible());
    }

    public addItems(item: Item[]) {
        this.items.push(...item);
    }

    public addItem(item: Item) {
        this.items.push(item);
    }

    public findItem(name: string, allowInvisibleItem = false): Item | undefined {
        return this.items.find((item) => item.matches(name) && (allowInvisibleItem || item.isVisible()));
    }

    public removeItem(item: Item) {
        this.items = this.items.filter((it) => it.name !== item.name);
    }
}
