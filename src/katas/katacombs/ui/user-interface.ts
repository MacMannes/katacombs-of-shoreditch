import { Room } from '@katas/katacombs/domain/model';

export type UserInterface = {
    displayRoom(room: Room): void;
    displayMessage(message: string): void;
};
