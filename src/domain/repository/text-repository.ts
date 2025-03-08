import { isDefined } from '@utils/array';
import { Room, TextWithAudioFiles } from '../index';

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

    public getRoomDescription(room: Room, preferredLength?: 'short' | 'long'): TextWithAudioFiles {
        const roomDescriptionTextKey = room.getDescription(preferredLength);
        const roomDescriptionText = this.getText(roomDescriptionTextKey);

        const npcTextKeys = this.getTextKeysForNpcs(room, preferredLength);
        const npcText = this.getConcatenatedText(npcTextKeys, ' ');

        const immovableItemsTextKeys = this.getTextKeysForRoomItems(room, { immovable: true, preferredLength });
        const immovableItemsText = this.getConcatenatedTextForItemKeys(immovableItemsTextKeys, ' ');

        const movableItemsTextKeys = this.getTextKeysForRoomItems(room, { immovable: false, preferredLength });
        const movableItemsText = this.getConcatenatedTextForItemKeys(movableItemsTextKeys, '\n\n');

        const shouldAddNewLines = movableItemsTextKeys.length > 0 || npcTextKeys.length > 0;
        const optionalNewLines = shouldAddNewLines ? '\n\n' : '';
        const text = `${roomDescriptionText} ${npcText}${immovableItemsText}${optionalNewLines}${movableItemsText}`;

        return new TextWithAudioFiles(text, [
            roomDescriptionTextKey,
            ...npcTextKeys,
            ...immovableItemsTextKeys.flat(),
            ...movableItemsTextKeys.flat(),
        ]);
    }

    private getTextKeysForNpcs(room: Room, preferredLength?: 'short' | 'long'): string[] {
        const length = preferredLength ?? this.getTextLengthForRoom(room);
        if (length === 'short') return [];

        return room
            .getNpcs()
            .map((npc) => npc.getDescription('room'))
            .filter(isDefined);
    }

    private getTextKeysForRoomItems(
        room: Room,
        options: { immovable: boolean; preferredLength?: 'short' | 'long' },
    ): string[][] {
        const length = options.preferredLength ?? this.getTextLengthForRoom(room);
        if (length === 'short' && options.immovable) return [];

        return room
            .getItems()
            .filter((item) => item.immovable === options.immovable)
            .map((item) => item.getDescription('room'));
    }

    private getTextLengthForRoom(room: Room): 'short' | 'long' {
        return room.getPreferredTextLength();
    }
}
