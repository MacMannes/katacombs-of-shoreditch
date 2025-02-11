import {
    Connection,
    FunctionResult,
    Item,
    ItemRepository,
    NPC,
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

    public addItemToRoom(item: Item) {
        this.getCurrentRoom().addItem(item);
    }

    public removeItemFromRoom(item: Item) {
        this.getCurrentRoom().removeItem(item);
    }

    public getTextWithAudioFiles(key: string): TextWithAudioFiles {
        return new TextWithAudioFiles(this.textRepository.getText(key) ?? '', [key]);
    }

    public getConcatenatedText(keys: string[], separator = ' '): string {
        return this.textRepository.getConcatenatedText(keys, separator);
    }

    public getConcatenatedTextForItemKeys(keys: string[][], separator: string): string {
        return this.textRepository.getConcatenatedTextForItemKeys(keys, separator);
    }

    public describeRoom(preferredLength?: 'short' | 'long'): TextWithAudioFiles {
        return this.textRepository.getRoomDescription(this.getCurrentRoom(), preferredLength);
    }

    public findRoom(direction: string): Room | undefined {
        const roomName = this.findConnection(direction)?.roomName;
        return roomName ? this.roomRepository.findRoomByName(roomName) : undefined;
    }

    public findConnection(direction: string): Connection | undefined {
        return this.getCurrentRoom().findConnection(direction);
    }

    public findNpc(name: string): NPC | undefined {
        return this.getCurrentRoom().findNpc(name);
    }
}

export type TakeItemResult = FunctionResult<Item, NotFoundError | ItemImmovableError>;
