import { CommandExecuteOptions, Command } from 'src/domain/commands';
import { CountableItem, Game } from 'src/domain';
import { UserInterface } from 'src/ui';

export class DropCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super({ requiresTarget: true });
    }

    async execute(
        params: string[],
        options?: CommandExecuteOptions,
    ): Promise<boolean> {
        const itemName = params[0];

        const dropped = this.drop(itemName);
        if (options?.caller === 'triggerAction') return dropped;

        const textKey = dropped ? 'msg-ok' : 'msg-not-carrying-it';
        this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return dropped;
    }

    private drop(itemName: string): boolean {
        const item = this.game.findItemInInventory(itemName);
        if (!item) return false;
        if (item instanceof CountableItem) {
            this.mergeWithItemFromRoom(item);
        }

        this.game.removeItemFromInventory(item);
        this.game.addItemToRoom(item);
        return true;
    }

    private mergeWithItemFromRoom(item: CountableItem) {
        const itemInRoom = this.game.findItemInRoom(item.name);
        if (itemInRoom && itemInRoom instanceof CountableItem) {
            item.mergeWith(itemInRoom);
            this.game.removeItemFromRoom(itemInRoom);
        }
    }
}
