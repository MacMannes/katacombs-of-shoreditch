import {
    Connection,
    CountableItem,
    Direction,
    FunctionResult,
    isDirection,
    Item,
    ItemRepository,
    Room,
    RoomRepository,
    TextRepository,
    TextWithAudioFiles,
} from '@katas/katacombs/domain';
import { ItemImmovableError, NotFoundError } from '@katas/katacombs/domain/error';
import { Player } from '@katas/katacombs/domain/model/player';

export class Game {
    private player: Player;

    constructor(
        private readonly roomRepository: RoomRepository,
        itemRepository: ItemRepository,
        private readonly textRepository: TextRepository,
    ) {
        const initialRoom = roomRepository.getRoomByName('start');
        this.player = new Player(initialRoom, itemRepository);
    }

    public getCurrentRoom(): Room {
        return this.player.getCurrentRoom();
    }

    public goToRoom(room: Room) {
        this.player.goToRoom(room);
    }

    public drop(itemName: string): boolean {
        const item = this.player.findItemInInventory(itemName);
        if (!item) return false;
        if (item instanceof CountableItem) {
            this.mergeWithItemFromRoom(item);
        }

        this.player.removeItemFromInventory(item);
        this.getCurrentRoom().addItem(item);
        return true;
    }

    private mergeWithItemFromRoom(item: CountableItem) {
        const itemInRoom = this.getCurrentRoom().findItem(item.name);
        if (itemInRoom && itemInRoom instanceof CountableItem) {
            item.mergeWith(itemInRoom);
            this.getCurrentRoom().removeItem(itemInRoom);
        }
    }

    public getInventory(): Item[] {
        return this.player.getInventory();
    }

    public findItem(itemName: string): Item | undefined {
        return this.findItemInRoom(itemName) ?? this.findItemInInventory(itemName);
    }

    public findItemInRoom(itemName: string): Item | undefined {
        return this.getCurrentRoom().findItem(itemName);
    }

    public findItemInInventory(itemName: string): Item | undefined {
        return this.player.findItemInInventory(itemName);
    }

    public addItemToInventory(item: Item) {
        this.player.addItemToInventory(item);
    }

    public removeItemFromInventory(item: Item) {
        this.player.removeItemFromInventory(item);
    }

    public removeItemFromInventoryByName(itemName: string) {
        this.player.removeItemFromInventoryByName(itemName);
    }

    public removeItemFromRoom(item: Item) {
        this.getCurrentRoom().removeItem(item);
    }

    public look(at: string): TextWithAudioFiles {
        if (isDirection(at)) {
            return this.getMessageForLookingInDirection(at);
        }

        const connection = this.getCurrentRoom().findConnection(at);
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
        const connection = this.getCurrentRoom().findConnection(direction);
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
        const npc = this.getCurrentRoom().findNpc(npcName);
        const textKey = npc?.getDescription('look');
        if (!textKey) return undefined;

        return this.getTextWithAudioFiles(textKey);
    }

    public getTextWithAudioFiles(key: string): TextWithAudioFiles {
        return new TextWithAudioFiles(this.textRepository.getText(key) ?? '', [key]);
    }

    private getConcatenatedText(keys: string[], separator = ' '): string {
        return this.textRepository.getConcatenatedText(keys, separator);
    }

    public getConcatenatedTextForItemKeys(keys: string[][], separator: string): string {
        return this.textRepository.getConcatenatedTextForItemKeys(keys, separator);
    }

    public describeRoom(preferredLength?: 'short' | 'long'): TextWithAudioFiles {
        return this.textRepository.getRoomDescription(this.getCurrentRoom(), preferredLength);
    }

    /**
     * Find a room in a given direction from the current room
     */
    public findRoom(direction: string): Room | undefined {
        const roomName = this.getCurrentRoom().findConnection(direction)?.roomName;
        return roomName ? this.roomRepository.findRoomByName(roomName) : undefined;
    }
}

export type TakeItemResult = FunctionResult<Item, NotFoundError | ItemImmovableError>;
