import { Room, TextWithAudioFiles } from '@katas/katacombs/domain/model';

export type UserInterface = {
    displayWelcomeMessage(): Promise<void>;
    displayRoomTitle(room: Room): void;
    displayMessage(message: TextWithAudioFiles): void;
    getUserInput(): Promise<string | undefined>;
};
