import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextToSpeechConverter } from '@katas/katacombs/utils/text-to-speech-converter';
import { createMockedObject } from '@utils/test';
import { TextToSpeachService } from '@katas/katacombs/utils/text-to-speach-service';
import { existsSync } from 'node:fs';

vi.mock('fs', () => ({
    existsSync: vi.fn(),
}));
const existsSyncMock = vi.mocked(existsSync);

describe('Text to Speech Converter', () => {
    const service = createMockedObject(TextToSpeachService);
    const converter = new TextToSpeechConverter(service);

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should call the TextToSpeechService for each text', async () => {
        existsSyncMock.mockReturnValue(false);

        const texts: Record<string, string> = {
            'msg-welcome': 'Welcome to Katacombs of Shoreditch',
            'msg-hello-world': 'Hello World!',
        };

        await converter.convert(texts);
        expect(service.convert).toBeCalledTimes(2);
    });

    it('should only call the TextToSpeechService for msg-welcome', async () => {
        existsSyncMock.mockImplementation((path) => path !== 'msg-welcome');

        const texts: Record<string, string> = {
            'msg-welcome': 'Welcome to Katacombs of Shoreditch',
            'msg-hello-world': 'Hello World!',
        };

        await converter.convert(texts);
        expect(service.convert).toBeCalledTimes(1);
        expect(service.convert).toBeCalledWith(
            'Welcome to Katacombs of Shoreditch',
            expect.stringContaining('msg-welcome'),
        );
    });
});
