export class TextToSpeechService {
    public async convert(text: string, filePath: string): Promise<void> {
        console.log(`Converting ${filePath}`);
    }
}
