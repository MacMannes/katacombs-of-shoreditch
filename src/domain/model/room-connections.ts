import { Connection, ConnectionOptions } from './connection';
import { Direction } from '../index';

export class RoomConnections {
    private readonly connections: Connection[] = [];

    public getAll(): Connection[] {
        return this.connections;
    }

    public createConnectionInDirection(direction: Direction, to: string, options?: ConnectionOptions): void {
        this.connections.push(new Connection(direction, to, options));
    }

    public addMultiple(connections: Connection[]): void {
        this.connections.push(...connections);
    }

    public find(direction: string, fromRoomName?: string): Connection | undefined {
        return this.connections.find((it) => it.matches(direction, fromRoomName));
    }
}
