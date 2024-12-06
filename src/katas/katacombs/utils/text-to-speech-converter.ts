import { TextToSpeechService } from '@katas/katacombs/utils';
import { existsSync } from 'node:fs';
import { getAbsolutePath, RESOURCES_PATH } from '@katas/katacombs/paths';
import path from 'node:path';

export class TextToSpeechConverter {
    constructor(private readonly service: TextToSpeechService) {}

    public async convert(texts: Record<string, string | undefined>): Promise<void> {
        for (const [fileName, text] of Object.entries(texts)) {
            if (!text || text.trim().length == 0) continue;

            const absolutePath = getAbsolutePath(path.join(RESOURCES_PATH, 'audio', `${fileName}.mp3`));
            if (!existsSync(absolutePath)) {
                await this.service.convert(text, absolutePath);
            }
        }
    }
}
