import { Room, TextWithAudioFiles } from '@katas/katacombs/domain/model';

export type UserInterface = {
    displayWelcomeMessage(): Promise<void>;
    displayRoom(room: Room, preferredLength?: 'short' | 'long'): Promise<void>;
    displayMessage(message: TextWithAudioFiles): Promise<void>;
    getUserInput(): Promise<string | undefined>;
};
