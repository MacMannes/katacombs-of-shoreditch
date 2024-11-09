import { Direction, isDirection, Item, ItemRepository, Room, RoomRepository } from '@katas/katacombs/domain';

export class Game {
    private currentRoom: Room;

    constructor(
        private readonly roomRepository: RoomRepository,
        private readonly itemRepository: ItemRepository,
    ) {
        this.currentRoom = roomRepository.getRoomByName('start');
    }

    public getCurrentRoom(): Room {
        return this.currentRoom;
    }

    public go(to: string): Room | undefined {
        const newRoom = this.findRoom(to);
        if (newRoom) {
            this.currentRoom = newRoom;
        }
        return newRoom;
    }

    public take(itemName: string): boolean {
        const item = this.currentRoom.findItem(itemName);
        if (!item) return false;

        this.currentRoom.removeItem(item);
        this.itemRepository.addItem(item);
        return true;
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

    public look(at: string): string {
        if (isDirection(at)) {
            return this.getMessageForLookingInDirection(at);
        }

        return this.getMessageForLookingAtItem(at) ?? `I see no ${at} here.`;
    }

    private getMessageForLookingInDirection(direction: Direction): string {
        const connection = this.currentRoom.findConnection(direction);
        return connection?.description ?? 'Nothing interesting to look at there.';
    }

    private getMessageForLookingAtItem(itemName: string): string | undefined {
        const item = this.findItem(itemName);
        if (item) {
            return item.description.look;
        }
    }

    /**
     * Find a room in a given direction from the current room
     */
    private findRoom(direction: string): Room | undefined {
        const roomName = this.currentRoom.findConnection(direction)?.roomName;
        return roomName ? this.roomRepository.findRoomByName(roomName) : undefined;
    }
}
