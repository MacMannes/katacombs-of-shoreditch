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
    CountableItem,
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
        if (item instanceof CountableItem) {
            this.mergeWithItemFromInventory(item);
        }

        this.currentRoom.removeItem(item);
        this.itemRepository.addItem(item);

        return { success: true, value: item };
    }

    private mergeWithItemFromInventory(item: CountableItem) {
        const itemInInventory = this.itemRepository.findItem(item.name);
        if (itemInInventory && itemInInventory instanceof CountableItem) {
            item.mergeWith(itemInInventory);
            this.itemRepository.removeItem(itemInInventory);
        }
    }

    public drop(itemName: string): boolean {
        const item = this.itemRepository.findItem(itemName);
        if (!item) return false;
        if (item instanceof CountableItem) {
            this.mergeWithItemFromRoom(item);
        }

        this.itemRepository.removeItem(item);
        this.currentRoom.addItem(item);
        return true;
    }

    private mergeWithItemFromRoom(item: CountableItem) {
        const itemInRoom = this.currentRoom.findItem(item.name);
        if (itemInRoom && itemInRoom instanceof CountableItem) {
            item.mergeWith(itemInRoom);
            this.currentRoom.removeItem(itemInRoom);
        }
    }

    public getItems(): Item[] {
        return this.itemRepository.getItems();
    }

    public findItem(itemName: string): Item | undefined {
        return this.currentRoom.findItem(itemName) ?? this.findItemInInventory(itemName);
    }

    public findItemInInventory(itemName: string): Item | undefined {
        return this.itemRepository.findItem(itemName);
    }

    public look(at: string): TextWithAudioFiles {
        if (isDirection(at)) {
            return this.getMessageForLookingInDirection(at);
        }

        const connection = this.currentRoom.findConnection(at);
        if (connection) {
            return this.getMessageForLookingAtConnection(connection);
        }

        return (
            this.getMessageForLookingAtItem(at) ??
            this.getMessageForLookingAtNpc(at) ??
            this.getTextWithAudioFiles('msg-cant-see-that')
        );
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

    private getMessageForLookingAtNpc(npcName: string): TextWithAudioFiles | undefined {
        const npc = this.currentRoom.findNpc(npcName);
        const textKey = npc?.getDescription('look');
        if (!textKey) return undefined;

        return this.getTextWithAudioFiles(textKey);
    }

    public getTextWithAudioFiles(key: string): TextWithAudioFiles {
        return new TextWithAudioFiles(this.textRepository.getText(key) ?? '', [key]);
    }

    public getConcatenatedText(keys: string[], separator = ' '): string {
        return keys
            .map((key) => this.getText(key))
            .filter(isDefined)
            .join(separator)
            .trim();
    }

    private getText(key: string): string | undefined {
        if (key.startsWith('count:')) {
            const count = key.split(':')[1];
            return `(${count})`;
        }
        return this.textRepository.getText(key);
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

        const npcTextKeys = this.getTextKeysForNpcs(preferredLength);
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

    private getTextKeysForNpcs(preferredLength?: 'short' | 'long'): string[] {
        const length = preferredLength ?? this.getTextLengthForRoom(this.currentRoom);
        if (length === 'short') return [];

        return this.currentRoom
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

export type TakeItemResult = FunctionResult<Item, NotFoundError | ItemImmovableError>;
