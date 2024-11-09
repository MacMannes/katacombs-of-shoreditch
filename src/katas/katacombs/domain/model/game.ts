import { Direction, isDirection, Room, RoomRepository } from '@katas/katacombs/domain';

export class Game {
    private currentRoom: Room;

    constructor(private readonly roomRepository: RoomRepository) {
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
        const item = this.getCurrentRoom().findItem(itemName);
        if (!item) return false;

        this.getCurrentRoom().removeItem(item);
        return true;
    }

    public getMessageForLookingAt(subject: string): string {
        if (isDirection(subject)) {
            return this.getMessageForLookingInDirection(subject);
        }

        return this.getMessageForLookingAtItem(subject) ?? `I see no ${subject} here.`;
    }

    private getMessageForLookingInDirection(direction: Direction): string {
        const connection = this.getCurrentRoom().findConnection(direction);
        return connection?.description ?? 'Nothing interesting to look at there.';
    }

    private getMessageForLookingAtItem(itemName: string): string | undefined {
        const item = this.getCurrentRoom().findItem(itemName);
        if (item) {
            return item.descriptions.look;
        }
    }

    /**
     * Find a room in a given direction from the current room
     */
    private findRoomInDirection(direction: Direction): Room | undefined {
        const roomName = this.getCurrentRoom().findConnection(direction)?.roomName;
        return roomName ? this.roomRepository.findRoomByName(roomName) : undefined;
    }
}
