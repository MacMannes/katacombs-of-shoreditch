export class Item {
    private words: string[] = [];

    constructor(
        readonly name: string,
        readonly descriptions: {
            inventory: string;
            room: string;
            look: string;
        },
        readonly options?: ItemOptions,
    ) {
        if (options?.words) this.words.push(...options.words);
    }

    public matches(word: string): boolean {
        return this.name === word || this.words.includes(word);
    }
}

type ItemOptions = {
    words?: string[];
};
