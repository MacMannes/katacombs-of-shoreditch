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
        if (!item) return { success: false, error: new NotFoundError(`Can't find ${itemName} here.`) };
        if (item.immovable) return { success: false, error: new ItemImmovableError(`You can't be serious!`) };

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

        return this.getMessageForLookingAtItem(at) ?? new TextWithAudioFiles(`I see no ${at} here.`);
    }

    private getMessageForLookingAtConnection(connection?: Connection): TextWithAudioFiles {
        const text = connection?.description ?? 'Nothing interesting to look at there.';
        return new TextWithAudioFiles(text);
    }

    private getMessageForLookingInDirection(direction: Direction): TextWithAudioFiles {
        const connection = this.currentRoom.findConnection(direction);
        const text = connection?.description ?? 'Nothing interesting to look at there.';
        return new TextWithAudioFiles(text);
    }

    private getMessageForLookingAtItem(itemName: string): TextWithAudioFiles | undefined {
        const item = this.findItem(itemName);
        if (!item) return undefined;

        const textKeys = item.getDescription('look');
        const text = this.textRepository.getConcatenatedText(textKeys);
        return new TextWithAudioFiles(text, textKeys);
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
