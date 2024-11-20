import { Room } from '@katas/katacombs/domain/model';

export type UserInterface = {
    displayWelcomeMessage(): void;
    displayRoom(room: Room): void;
    displayMessage(message: string): void;
    getUserInput(): Promise<string | undefined>;
};
