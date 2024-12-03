import { Room, TextWithAudioFiles } from '@katas/katacombs/domain';
import { isDefined } from '@utils/array';

export class TextRepository {
    constructor(private readonly texts: Record<string, string>) {}

    public getText(key: string): string | undefined {
        return this.texts[key];
    }

    public getConcatenatedText(keys: string[], separator: string = ' '): string {
        return keys
            .map((key) => this.getText(key))
            .filter(isDefined)
            .join(separator)
            .trim();
    }

    public describeRoom(room: Room, preferredLength?: 'short' | 'long'): TextWithAudioFiles {
        const roomDescriptionTextKey = room.getDescription(preferredLength);
        const roomDescriptionText = this.getText(roomDescriptionTextKey);

        const immovableItemTextKeys = room
            .getItems()
            .filter((item) => item.immovable)
            .map((item) => item.getDescription('room'));
        const immovableItemsText = immovableItemTextKeys
            .map((keys) => this.getConcatenatedText(keys))
            .filter(isDefined)
            .join(' ');

        const movableItemsTextKeys = room
            .getItems()
            .filter((item) => !item.immovable)
            .map((item) => item.getDescription('room'));
        const movableItemsText = movableItemsTextKeys
            .map((keys) => this.getConcatenatedText(keys))
            .filter(isDefined)
            .join('\n\n');

        const optionalNewLines = movableItemsTextKeys.length > 0 ? '\n\n' : '';
        const text = `${roomDescriptionText} ${immovableItemsText}${optionalNewLines}${movableItemsText}`;

        return new TextWithAudioFiles(text, [
            roomDescriptionTextKey,
            ...immovableItemTextKeys.flat(),
            ...movableItemsTextKeys.flat(),
        ]);
    }
}
