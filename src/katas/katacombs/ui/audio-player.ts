export type AudioPlayer = {
    play(...fileNames: string[]): void;
    playAsync(fileName: string): Promise<void>;
    stop(): void;
};
