export class TextRepository {
    constructor(private readonly texts: Record<string, string>) {}

    public getText(key: string): string | undefined {
        return this.texts[key];
    }
}
