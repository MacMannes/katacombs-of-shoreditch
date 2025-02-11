import { isDefined } from '@utils/array';

export class TextRepository {
    constructor(private readonly texts: Record<string, string>) {}

    public getText(key: string): string | undefined {
        if (key.startsWith('count:')) {
            const count = key.split(':')[1];
            return `(${count})`;
        }

        return this.texts[key];
    }

    public getConcatenatedTextForItemKeys(keys: string[][], separator: string): string {
        return keys
            .map((keys) => this.getConcatenatedText(keys, ' '))
            .filter(isDefined)
            .join(separator)
            .trim();
    }

    public getConcatenatedText(keys: string[], separator = ' '): string {
        return keys
            .map((key) => this.getText(key))
            .filter(isDefined)
            .join(separator)
            .trim();
    }
}
