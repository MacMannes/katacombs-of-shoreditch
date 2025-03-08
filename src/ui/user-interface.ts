import { TextWithAudioFiles } from '../domain/model';

export type UserInterface = {
    displayWelcomeMessage(): Promise<void>;
    displayRoomTitle(title: string): void;
    displayMessage(message: TextWithAudioFiles): void;
    displayMessageAsync(message: TextWithAudioFiles): Promise<void>;
    getUserInput(): Promise<string | undefined>;
    getUserChoice(options: Choice[]): Promise<string>;
};

export type Choice = {
    value: string;
    text: string;
};
