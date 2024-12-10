import { ActionTriggerExecutor, Game, Item, Room, TextWithAudioFiles } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import { CommandFactory, InventoryCommand, QuitCommand } from '@katas/katacombs/commands';

export class GameController {
    private isPlaying = true;
    private readonly commandFactory: CommandFactory;
    private readonly actionTriggerExecutor: ActionTriggerExecutor;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        this.commandFactory = new CommandFactory(this.game, this.ui);
        this.actionTriggerExecutor = new ActionTriggerExecutor(this.game, this.ui);
    }

    public async startGame() {
        await this.ui.displayWelcomeMessage();
        this.displayCurrentRoom();

        while (this.isPlaying) {
            const userInput = (await this.ui.getUserInput()) ?? '';
            const [verb, target] = userInput.split(' ');
            this.processCommand(verb, target);
        }

        await this.ui.displayMessageAsync(this.game.getTextWithAudioFiles('msg-bye'));
    }

    public getCurrentRoom(): Room {
        return this.game.getCurrentRoom();
    }

    public getInventory(): Item[] {
        return this.game.getItems();
    }

    public processCommand(verb: string, target?: string) {
        const didExecuteTrigger = this.actionTriggerExecutor.execute(target, verb);
        if (didExecuteTrigger) return;

        const command = this.commandFactory.create(verb, target);
        if (!command || command.isInternal) {
            this.ui.displayMessage(new TextWithAudioFiles('What?', ['msg-what']));
            return;
        }

        const result = command.execute([target ?? ''], { caller: 'commandProcessor' });
        if (command instanceof QuitCommand) {
            this.isPlaying = !result;
        }
    }

    public findItem(itemName: string): Item | undefined {
        return this.game.findItem(itemName);
    }

    public displayInventory(): boolean {
        return new InventoryCommand(this.game, this.ui).execute([]);
    }

    private displayCurrentRoom(preferredLength?: 'short' | 'long') {
        this.ui.displayRoomTitle(this.getCurrentRoom());
        this.displayRoom(preferredLength);
    }

    private displayRoom(preferredLength?: 'short' | 'long') {
        const roomDescription = this.game.describeRoom(preferredLength);
        this.ui.displayMessage(roomDescription);
    }
}
