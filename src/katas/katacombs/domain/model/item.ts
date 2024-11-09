export class Item {
    private readonly words: string[] = [];

    constructor(
        readonly name: string,
        readonly description: {
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
