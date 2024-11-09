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

    public moveToDirection(direction: Direction): Room | undefined {
        const newRoom = this.findRoomInDirection(direction);
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

        this.currentRoom.addItem(item);
        return true;
    }

    public getItems(): Item[] {
        return this.itemRepository.getItems();
    }

    public findItem(itemName: string): Item | undefined {
        return this.itemRepository.findItem(itemName);
    }

    public getMessageForLookingAt(subject: string): string {
        if (isDirection(subject)) {
            return this.getMessageForLookingInDirection(subject);
        }

        return this.getMessageForLookingAtItem(subject) ?? `I see no ${subject} here.`;
    }

    private getMessageForLookingInDirection(direction: Direction): string {
        const connection = this.currentRoom.findConnection(direction);
        return connection?.description ?? 'Nothing interesting to look at there.';
    }

    private getMessageForLookingAtItem(itemName: string): string | undefined {
        const item = this.currentRoom.findItem(itemName);
        if (item) {
            return item.descriptions.look;
        }
    }

    /**
     * Find a room in a given direction from the current room
     */
    private findRoomInDirection(direction: Direction): Room | undefined {
        const roomName = this.currentRoom.findConnection(direction)?.roomName;
        return roomName ? this.roomRepository.findRoomByName(roomName) : undefined;
    }
}
