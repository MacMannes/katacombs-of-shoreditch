export type AudioPlayer = {
    play(...fileNames: string[]): Promise<void>;
};
