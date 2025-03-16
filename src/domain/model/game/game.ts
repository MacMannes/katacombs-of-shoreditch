import type { ItemImmovableError } from 'src/domain/error/item-immovable-error.ts';
import type { NotFoundError } from 'src/domain/error/not-found-error.ts';
import { Player } from 'src/domain/model/player.ts';
import type { ItemRepository } from 'src/domain/repository/item-repository.ts';
import type { RoomRepository } from 'src/domain/repository/room-repository.ts';
import type { TextRepository } from 'src/domain/repository/text-repository.ts';
import type { Connection } from 'src/domain/model/connection.ts';
import type { FunctionResult } from 'src/domain/model/function-result.ts';
import type { Item } from 'src/domain/model/item/item.ts';
import type { NPC } from 'src/domain/model/npc.ts';
import type { Room } from 'src/domain/model/room/room.ts';
import { TextWithAudioFiles } from 'src/domain/model/text-with-audio-files.ts';

export class Game {
    private readonly player: Player;
    private readonly roomRepository: RoomRepository;
    private readonly textRepository: TextRepository;

    constructor(
        roomRepository: RoomRepository,
        itemRepository: ItemRepository,
        textRepository: TextRepository,
    ) {
        const initialRoom = roomRepository.getRoomByName('start');
        this.player = new Player(initialRoom, itemRepository);
        this.roomRepository = roomRepository;
        this.textRepository = textRepository;
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
        return (
            this.findItemInRoom(itemName) ?? this.findItemInInventory(itemName)
        );
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
        return new TextWithAudioFiles(this.textRepository.getText(key) ?? '', [
            key,
        ]);
    }

    public getConcatenatedText(keys: string[], separator = ' '): string {
        return this.textRepository.getConcatenatedText(keys, separator);
    }

    public getConcatenatedTextForItemKeys(
        keys: string[][],
        separator: string,
    ): string {
        return this.textRepository.getConcatenatedTextForItemKeys(
            keys,
            separator,
        );
    }

    public describeRoom(
        preferredLength?: 'short' | 'long',
    ): TextWithAudioFiles {
        return this.textRepository.getRoomDescription(
            this.getCurrentRoom(),
            preferredLength,
        );
    }

    public findRoom(direction: string): Room | undefined {
        const roomName = this.findConnection(direction)?.roomName;
        return roomName
            ? this.roomRepository.findRoomByName(roomName)
            : undefined;
    }

    public findConnection(direction: string): Connection | undefined {
        return this.getCurrentRoom().findConnection(direction);
    }

    public findNpc(name: string): NPC | undefined {
        return this.getCurrentRoom().findNpc(name);
    }
}

export type TakeItemResult = FunctionResult<
    Item,
    NotFoundError | ItemImmovableError
>;
