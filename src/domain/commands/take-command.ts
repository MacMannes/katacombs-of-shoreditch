import type { UserInterface } from 'src/ui/user-interface.ts';
import { ItemImmovableError } from 'src/domain/error/item-immovable-error.ts';
import { NotFoundError } from 'src/domain/error/not-found-error.ts';
import type { Game, TakeItemResult } from 'src/domain/model/game/game.ts';
import { CountableItem } from 'src/domain/model/item/countable-item.ts';
import {
    Command,
    type CommandExecuteOptions,
} from 'src/domain/commands/command.ts';

export class TakeCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    async execute(
        params: string[],
        options?: CommandExecuteOptions,
    ): Promise<boolean> {
        const itemName = params[0];
        if (!itemName) return false;

        const result = this.take(itemName);
        const textKey = result.success ? 'msg-ok' : result.error.message;

        if (options?.caller === 'triggerAction') return result.success;

        this.ui.displayMessage(this.game.getTextWithAudioFiles(textKey));
        return result.success;
    }

    private take(itemName: string): TakeItemResult {
        const item = this.game.findItemInRoom(itemName);
        if (!item)
            return {
                success: false,
                error: new NotFoundError('msg-cant-find-that'),
            };
        if (item.immovable)
            return {
                success: false,
                error: new ItemImmovableError('msg-cant-be-serious'),
            };
        if (item instanceof CountableItem) {
            this.mergeWithItemFromInventory(item);
        }

        this.game.removeItemFromRoom(item);
        this.game.addItemToInventory(item);

        return { success: true, value: item };
    }

    private mergeWithItemFromInventory(item: CountableItem) {
        const itemInInventory = this.game.findItemInInventory(item.name);
        if (itemInInventory && itemInInventory instanceof CountableItem) {
            item.mergeWith(itemInInventory);
            this.game.removeItemFromInventory(itemInInventory);
        }
    }
}
