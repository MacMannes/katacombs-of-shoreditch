import { TextToSpeechService } from '@katas/katacombs/utils';
import { existsSync } from 'node:fs';

export class TextToSpeechConverter {
    constructor(private readonly service: TextToSpeechService) {}

    public async convert(texts: Record<string, string>): Promise<void> {
        for (const [fileName, text] of Object.entries(texts)) {
            if (!existsSync(fileName)) {
                await this.service.convert(text, fileName);
            }
        }
    }
}
