import type {
    Connection,
    ConnectionOptions,
} from 'src/domain/model/connection.ts';
import type { Item } from 'src/domain/model/item/item.ts';
import type { NPC } from 'src/domain/model/npc.ts';
import { RoomConnections } from 'src/domain/model/room/room-connections.ts';
import { RoomDescription } from 'src/domain/model/room/room-description.ts';
import { RoomIdentity } from 'src/domain/model/room/room-identity.ts';
import { RoomInventory } from 'src/domain/model/room/room-inventory.ts';
import { RoomVisits } from 'src/domain/model/room/room-visits.ts';
import type { Direction } from 'src/domain/model/direction.ts';

export class Room {
    private readonly identity: RoomIdentity;
    private readonly description: RoomDescription;
    private readonly inventory = new RoomInventory();
    private readonly visits = new RoomVisits();
    private readonly connections = new RoomConnections();

    constructor(
        name: string,
        title: string,
        description: string,
        shortDescription?: string,
    ) {
        this.identity = new RoomIdentity(name, title);
        this.description = new RoomDescription(description, shortDescription);
    }

    public getName(): string {
        return this.identity.getName();
    }

    public getTitle(): string {
        return this.identity.getTitle();
    }

    public addVisit(): number {
        return this.visits.addVisit();
    }

    public getDescription(preferredLength?: 'short' | 'long'): string {
        return this.description.getDescription(
            preferredLength ?? this.getPreferredTextLength(),
        );
    }

    public getConnections(): Connection[] {
        return this.connections.getAll();
    }

    public createConnectionInDirection(
        direction: Direction,
        to: string,
        options?: ConnectionOptions,
    ) {
        this.connections.createConnectionInDirection(direction, to, options);
    }

    public addConnections(connections: Connection[]) {
        this.connections.addMultiple(connections);
    }

    public findConnection(
        direction: string,
        fromRoomName?: string,
    ): Connection | undefined {
        return this.connections.find(direction, fromRoomName);
    }

    public getItems(allowInvisibleItems = false): Item[] {
        return this.inventory.getItems(allowInvisibleItems);
    }

    public addItems(item: Item[]) {
        this.inventory.addItems(item);
    }

    public addItem(item: Item) {
        this.inventory.addItem(item);
    }

    public addNpcs(npcs: NPC[]) {
        this.inventory.addNpcs(npcs);
    }

    public getNpcs(): NPC[] {
        return this.inventory.getNpcs();
    }

    public findNpc(name: string): NPC | undefined {
        return this.inventory.findNpc(name);
    }

    public findItem(
        name: string,
        allowInvisibleItem = false,
    ): Item | undefined {
        return this.inventory.findItem(name, allowInvisibleItem);
    }

    public removeItem(item: Item) {
        this.inventory.removeItem(item);
    }

    public getPreferredTextLength(): 'short' | 'long' {
        return this.visits.getPreferredTextLength();
    }
}
