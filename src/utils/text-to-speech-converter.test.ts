import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { getAbsolutePath, RESOURCES_PATH } from '../paths';
import path from 'node:path';
import { createMockedObject } from './test';
import { TextToSpeechService } from './text-to-speech-service';
import { TextToSpeechConverter } from './text-to-speech-converter';

vi.mock('fs', () => ({
    existsSync: vi.fn(),
}));
const existsSyncMock = vi.mocked(existsSync);

describe('Text to Speech Converter', () => {
    const service = createMockedObject(TextToSpeechService);
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

    it('should add .mp3 to the fileName', async () => {
        existsSyncMock.mockReturnValue(false);

        const texts: Record<string, string> = {
            'msg-welcome': 'Welcome to Katacombs of Shoreditch',
            'msg-hello-world': 'Hello World!',
        };

        await converter.convert(texts);
        expect(service.convert).toBeCalledTimes(2);
        expect(service.convert).toBeCalledWith(expect.anything(), expect.stringContaining('.mp3'));
    });

    it('should use absolute paths', async () => {
        existsSyncMock.mockReturnValue(false);
        const pathPrefix = getAbsolutePath(path.join(RESOURCES_PATH, 'audio'));

        const texts: Record<string, string> = {
            'msg-welcome': 'Welcome to Katacombs of Shoreditch',
            'msg-hello-world': 'Hello World!',
        };

        await converter.convert(texts);
        expect(service.convert).toBeCalledTimes(2);
        expect(service.convert).toBeCalledWith(expect.anything(), expect.stringContaining(pathPrefix));
    });

    it('should not convert strings that are empty', async () => {
        existsSyncMock.mockReturnValue(false);
        const texts: Record<string, string | undefined> = {
            'msg-welcome': 'Welcome to Katacombs of Shoreditch',
            'msg-hello-world': 'Hello World!',
            'msg-nothing': ' ',
            'msg-empty': '',
            'msg-undefined': undefined,
        };

        await converter.convert(texts);
        expect(service.convert).toBeCalledTimes(2);
        expect(service.convert).not.toBeCalledWith(expect.anything(), expect.stringContaining('msg-nothing'));
        expect(service.convert).not.toBeCalledWith(expect.anything(), expect.stringContaining('msg-empty'));
        expect(service.convert).not.toBeCalledWith(expect.anything(), expect.stringContaining('msg-undefined'));
    });
    it('should only call the TextToSpeechService for msg-welcome', async () => {
        existsSyncMock.mockImplementation((path) => !path.toString().includes('msg-welcome'));

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
