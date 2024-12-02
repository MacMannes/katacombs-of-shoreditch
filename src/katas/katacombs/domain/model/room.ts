import { Connection, ConnectionOptions, Direction, Item, TextWithAudioFiles } from '@katas/katacombs/domain';

export class Room {
    private readonly connections: Connection[] = [];
    private items: Item[] = [];
    private numberOfVisits = 0;

    constructor(
        public readonly name: string,
        public readonly title: string,
        public readonly description: string,
        public readonly shortDescription?: string,
    ) {}

    public addVisit(): number {
        return this.numberOfVisits++;
    }

    public getNumberOfVisits(): number {
        return this.numberOfVisits;
    }

    public getDescription(preferredLength?: 'short' | 'long'): TextWithAudioFiles {
        if (preferredLength === 'long') return this.getLongDescription();
        if (preferredLength === 'short') return this.getShortDescription();

        return this.numberOfVisits > 1 ? this.getShortDescription() : this.getLongDescription();
    }

    private getLongDescription(): TextWithAudioFiles {
        return new TextWithAudioFiles(this.description, [`room-${this.name}`]);
    }

    private getShortDescription(): TextWithAudioFiles {
        if (!this.shortDescription) return this.getLongDescription();

        return new TextWithAudioFiles(this.shortDescription, [`room-${this.name}-short`]);
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

    public findItem(name: string, allowInvisibleItem = false): Item | undefined {
        return this.items.find((item) => item.matches(name) && (allowInvisibleItem || item.isVisible()));
    }

    public removeItem(item: Item) {
        this.items = this.items.filter((it) => it.name !== item.name);
    }
}
