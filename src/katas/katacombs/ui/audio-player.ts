export type AudioPlayer = {
    play(fileName: string): Promise<void>;
};
