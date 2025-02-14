export class ItemIdentifier {
    private readonly name: string;
    private readonly synonyms: Set<string>;

    constructor(name: string, synonyms?: string[]) {
        this.name = name;
        this.synonyms = new Set(synonyms ?? []);
    }

    public matches(word: string): boolean {
        return this.name === word || this.synonyms.has(word);
    }
}
