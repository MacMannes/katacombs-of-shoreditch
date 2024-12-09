import {
    ActionTrigger,
    CallerId,
    CommandAction,
    CommandHandler,
    Condition,
    Game,
    Item,
    Room,
    TextWithAudioFiles,
} from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import {
    ChangeStateCommand,
    CommandFactory,
    DropCommand,
    GoCommand,
    HideCommand,
    InventoryCommand,
    LookCommand,
    QuitCommand,
    RevealCommand,
    TakeCommand,
} from '@katas/katacombs/commands';
import { isDefined } from '@utils/array';

export class GameController {
    private isPlaying = true;
    private readonly commandFactory: CommandFactory;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        this.commandFactory = new CommandFactory(this.game, this.ui);
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
        const executedItemTriggers = this.executeItemTriggers(target, verb);
        if (executedItemTriggers) return;

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

    private executeItemTriggers(target: string | undefined, verb: string): boolean {
        let executedTrigger = false;

        const targetItem = target ? this.findItem(target) : undefined;
        targetItem?.triggers
            ?.filter((trigger) => this.shouldExecuteTrigger(trigger, verb))
            ?.forEach((trigger) => {
                trigger.actions.forEach((action) => this.executeTriggerAction(action));
                executedTrigger = true;
            });

        return executedTrigger;
    }

    private shouldExecuteTrigger(trigger: ActionTrigger, verb: string): boolean {
        if (trigger.verb !== verb) return false;

        if (trigger.conditions) {
            return this.verifyConditions(trigger.conditions);
        }

        return true;
    }

    private verifyConditions(conditions: Condition[]): boolean {
        const checkConditions = conditions.map((condition) => this.verifyCondition(condition));
        return checkConditions.every((value) => value);
    }

    private verifyCondition(condition: Condition): boolean {
        if (condition.type === 'location' && condition.key === 'currentLocation') {
            return this.game.getCurrentRoom().name === condition.value;
        }
        if (condition.type === 'hasState') {
            return this.game.getCurrentRoom().findItem(condition.key)?.getCurrentState() === condition.value;
        }

        return false;
    }

    private executeTriggerAction(action: CommandAction) {
        const command = this.commandFactory.create(action.command, action.argument);
        if (!command) return false;

        const params = [action.argument, action.parameter].filter(isDefined);
        const result = command.execute(params, { caller: 'triggerAction' });

        this.displayActionResultMessage(action, result);
    }

    private displayActionResultMessage(action: CommandAction, result: boolean) {
        const message = result ? action.responses?.success : action.responses?.failure;
        if (!message) return;

        this.ui.displayMessage(this.game.getTextWithAudioFiles(message));
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
