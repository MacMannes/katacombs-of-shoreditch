import { Item, ItemRepository, Room } from '@katas/katacombs/domain';

export class Player {
    private currentRoom: Room;
    private readonly inventory: ItemRepository;

    constructor(initialRoom: Room, inventory: ItemRepository) {
        this.currentRoom = initialRoom;
        this.inventory = inventory;

        initialRoom.addVisit();
    }

    public getCurrentRoom(): Room {
        return this.currentRoom;
    }

    public getInventory(): Item[] {
        return this.inventory.getItems();
    }

    public findItemInInventory(itemName: string) {
        return this.inventory.findItem(itemName);
    }

    public addItemToInventory(item: Item) {
        this.inventory.addItem(item);
    }

    public removeItemFromInventory(item: Item) {
        this.inventory.removeItem(item);
    }

    public goToRoom(room: Room) {
        room.addVisit();
        this.currentRoom = room;
    }
}
