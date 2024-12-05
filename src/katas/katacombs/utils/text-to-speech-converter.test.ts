import { describe, expect, it } from 'vitest';
import { TextToSpeechConverter } from '@katas/katacombs/utils/text-to-speech-converter';
import { createMockedObject } from '@utils/test';
import { TextToSpeachService } from '@katas/katacombs/utils/text-to-speach-service';

describe('Text to Speech Converter', () => {
    const service = createMockedObject(TextToSpeachService);
    const converter = new TextToSpeechConverter(service);

    it('should call the TextToSpeechService', async () => {
        const texts: Record<string, string> = {
            'msg-welcome': 'Welcome to Katacombs of Shoreditch',
            'msg-hello-world': 'Hello World!',
        };

        await converter.convert(texts);
        expect(service.convert).toBeCalledTimes(2);
    });
});
