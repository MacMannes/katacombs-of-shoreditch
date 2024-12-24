import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

export class TextToSpeechService {
    private readonly client = new ElevenLabsClient();

    public async convert(text: string, filePath: string): Promise<void> {
        console.log(`Converting ${filePath}`);

        const audioStream = await this.client.generate({
            voice: 'Callum',
            model_id: 'eleven_turbo_v2_5',
            text,
        });

        const fileStream = createWriteStream(filePath);

        // Manually read chunks and write them to the file
        for await (const chunk of audioStream) {
            fileStream.write(chunk);
        }

        fileStream.end();

        console.log(`Conversion complete: ${filePath}`);
    }
}
