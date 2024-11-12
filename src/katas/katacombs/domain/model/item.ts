export class Item {
    public readonly description: Description;
    private readonly words: string[] = [];

    constructor(
        readonly name: string,
        readonly options: ItemOptions,
    ) {
        this.description = options.description;
        if (options.words) this.words.push(...options.words);
    }

    public matches(word: string): boolean {
        return this.name === word || this.words.includes(word);
    }
}

type Description = {
    inventory: string;
    room: string;
    look: string;
};

type ItemOptions = {
    description: Description;
    words?: string[];
};
