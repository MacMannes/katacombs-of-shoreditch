import { Room, TextWithAudioFiles } from '@katas/katacombs/domain/model';

export type UserInterface = {
    displayWelcomeMessage(): Promise<void>;
    displayRoomTitle(room: Room): Promise<void>;
    displayMessage(message: TextWithAudioFiles): Promise<void>;
    getUserInput(): Promise<string | undefined>;
};
