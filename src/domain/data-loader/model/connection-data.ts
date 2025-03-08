import { Connection, isDirection } from 'src/domain';
import { isDefined } from 'src/utils/array';

export type ConnectionData = {
    direction: string;
    to: string;
    description?: string;
    words?: [];
};

export function toConnections(connections?: ConnectionData[] | undefined): Connection[] {
    if (!connections) return [];

    return connections.map((connection) => toConnection(connection)).filter(isDefined);
}

function toConnection(connection: ConnectionData): Connection | undefined {
    if (!isDirection(connection.direction)) return undefined;

    return new Connection(connection.direction, connection.to, {
        description: connection.description,
        words: connection.words,
    });
}
