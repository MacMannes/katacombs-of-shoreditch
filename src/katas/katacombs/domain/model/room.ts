import { Connection, ConnectionOptions, Direction, Item, NPC, RoomDescription } from '@katas/katacombs/domain';

export class Room {
    public readonly name: string;
    public readonly title: string;

    private numberOfVisits = 0;
    private readonly description: RoomDescription;

    private readonly connections: Connection[] = [];
    private items: Item[] = [];
    private npcs: NPC[] = [];

    constructor(name: string, title: string, description: string, shortDescription?: string) {
        this.name = name;
        this.title = title;
        this.description = new RoomDescription(description, shortDescription);
    }

    public addVisit(): number {
        return this.numberOfVisits++;
    }

    public getNumberOfVisits(): number {
        return this.numberOfVisits;
    }

    public getDescription(preferredLength?: 'short' | 'long'): string {
        return this.description.getDescription(this.numberOfVisits, preferredLength);
    }

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

    public addNpcs(npcs: NPC[]) {
        this.npcs.push(...npcs);
    }

    public getNpcs(): NPC[] {
        return this.npcs;
    }

    public findNpc(name: string): NPC | undefined {
        return this.npcs.find((npc) => npc.name === name);
    }

    public findItem(name: string, allowInvisibleItem = false): Item | undefined {
        return this.items.find((item) => item.matches(name) && (allowInvisibleItem || item.isVisible()));
    }

    public removeItem(item: Item) {
        this.items = this.items.filter((it) => it.name !== item.name);
    }
}
