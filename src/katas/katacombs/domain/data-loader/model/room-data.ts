import { ConnectionData } from '@katas/katacombs/domain';

export type RoomData = {
    name: string;
    title: string;
    description: string;
    connections?: ConnectionData[];
};
