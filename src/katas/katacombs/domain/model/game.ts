import {
    Connection,
    TextWithAudioFiles,
    Direction,
    FunctionResult,
    isDirection,
    Item,
    ItemRepository,
    Room,
    RoomRepository,
    TextRepository,
} from '@katas/katacombs/domain';
import { ItemImmovableError, NotFoundError } from '@katas/katacombs/domain/error';
import { isDefined } from '@utils/array';

export class Game {
    private currentRoom: Room;

    constructor(
        private readonly roomRepository: RoomRepository,
        private readonly itemRepository: ItemRepository,
        private readonly textRepository: TextRepository,
    ) {
        this.currentRoom = roomRepository.getRoomByName('start');
        this.currentRoom.addVisit();
    }

    public getCurrentRoom(): Room {
        return this.currentRoom;
    }

    public go(to: string): Room | undefined {
        const newRoom = this.findRoom(to);
        if (newRoom) {
            newRoom.addVisit();
            this.currentRoom = newRoom;
        }
        return newRoom;
    }

    public take(itemName: string): TakeItemResult {
        const item = this.currentRoom.findItem(itemName);
        if (!item) return { success: false, error: new NotFoundError('msg-cant-find-that') };
        if (item.immovable) return { success: false, error: new ItemImmovableError('msg-cant-be-serious') };

        this.currentRoom.removeItem(item);
        this.itemRepository.addItem(item);

        return { success: true, value: item };
    }

    public drop(itemName: string): boolean {
        const item = this.itemRepository.findItem(itemName);
        if (!item) return false;

        this.itemRepository.removeItem(item);
        this.currentRoom.addItem(item);
        return true;
    }

    public getItems(): Item[] {
        return this.itemRepository.getItems();
    }

    public findItem(itemName: string): Item | undefined {
        return this.currentRoom.findItem(itemName) ?? this.itemRepository.findItem(itemName);
    }

    public look(at: string): TextWithAudioFiles {
        if (isDirection(at)) {
            return this.getMessageForLookingInDirection(at);
        }

        const connection = this.currentRoom.findConnection(at);
        if (connection) {
            return this.getMessageForLookingAtConnection(connection);
        }

        return this.getMessageForLookingAtItem(at) ?? this.getTextWithAudioFiles('msg-cant-see-that');
    }

    private getMessageForLookingAtConnection(connection?: Connection): TextWithAudioFiles {
        const textKey = connection?.description ?? 'msg-nothing-interesting';
        return this.getTextWithAudioFiles(textKey);
    }

    private getMessageForLookingInDirection(direction: Direction): TextWithAudioFiles {
        const connection = this.currentRoom.findConnection(direction);
        const textKey = connection?.description ?? 'msg-nothing-interesting';
        return this.getTextWithAudioFiles(textKey);
    }

    private getMessageForLookingAtItem(itemName: string): TextWithAudioFiles | undefined {
        const item = this.findItem(itemName);
        if (!item) return undefined;

        const textKeys = item.getDescription('look');
        const text = this.getConcatenatedText(textKeys);
        return new TextWithAudioFiles(text, textKeys);
    }

    public getTextWithAudioFiles(key: string): TextWithAudioFiles {
        return new TextWithAudioFiles(this.textRepository.getText(key) ?? '', [key]);
    }

    public getConcatenatedText(keys: string[], separator = ' '): string {
        return keys
            .map((key) => this.textRepository.getText(key))
            .filter(isDefined)
            .join(separator)
            .trim();
    }

    public getConcatenatedTextForItemKeys(keys: string[][], separator: string): string {
        return keys
            .map((keys) => this.getConcatenatedText(keys, ' '))
            .filter(isDefined)
            .join(separator)
            .trim();
    }

    public describeRoom(preferredLength?: 'short' | 'long'): TextWithAudioFiles {
        const room = this.currentRoom;
        const roomDescriptionTextKey = room.getDescription(preferredLength);
        const roomDescriptionText = this.textRepository.getText(roomDescriptionTextKey);

        const immovableItemsTextKeys = this.getTextKeysForRoomItems(room, { immovable: true, preferredLength });
        const immovableItemsText = this.getConcatenatedTextForItemKeys(immovableItemsTextKeys, ' ');

        const movableItemsTextKeys = this.getTextKeysForRoomItems(room, { immovable: false, preferredLength });
        const movableItemsText = this.getConcatenatedTextForItemKeys(movableItemsTextKeys, '\n\n');

        const optionalNewLines = movableItemsTextKeys.length > 0 ? '\n\n' : '';
        const text = `${roomDescriptionText} ${immovableItemsText}${optionalNewLines}${movableItemsText}`;

        return new TextWithAudioFiles(text, [
            roomDescriptionTextKey,
            ...immovableItemsTextKeys.flat(),
            ...movableItemsTextKeys.flat(),
        ]);
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
        return room.getNumberOfVisits() > 1 ? 'short' : 'long';
    }

    /**
     * Find a room in a given direction from the current room
     */
    private findRoom(direction: string): Room | undefined {
        const roomName = this.currentRoom.findConnection(direction)?.roomName;
        return roomName ? this.roomRepository.findRoomByName(roomName) : undefined;
    }
}

export type TakeItemResult = FunctionResult<NotFoundError | ItemImmovableError, Item>;
