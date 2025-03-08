export class TextWithAudioFiles {
    public readonly text: string;
    public readonly audioFiles: string[];

    constructor(text: string, audioFiles?: string[]) {
        this.text = text;
        this.audioFiles = audioFiles ?? [];
    }
}
