import { Room } from '@katas/katacombs/domain/model';

export type UserInterface = {
    displayWelcomeMessage(): Promise<void>;
    displayRoom(room: Room): Promise<void>;
    displayMessage(message: string, audioFiles?: string[]): Promise<void>;
    getUserInput(): Promise<string | undefined>;
};
