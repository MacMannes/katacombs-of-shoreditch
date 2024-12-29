import { ActionTrigger, CommandAction, Condition, ConditionVerifier, Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import { CommandFactory } from '@katas/katacombs/commands';
import { isDefined } from '@utils/array';

export class ActionTriggerExecutor {
    private readonly commandFactory: CommandFactory;
    private readonly conditionVerifier: ConditionVerifier;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        this.commandFactory = new CommandFactory(this.game, this.ui);
        this.conditionVerifier = new ConditionVerifier(this.game);
    }

    public async execute(target: string | undefined, verb: string): Promise<boolean> {
        const targetItem = target ? this.game.findItem(target) : undefined;
        const triggers = targetItem?.triggers?.filter((trigger) => this.shouldExecuteTrigger(trigger, verb));
        if (!triggers) return false;

        const actions = triggers.flatMap((trigger) => trigger.actions);
        let executedTrigger = false;
        for await (const action of actions) {
            await this.executeTriggerAction(action);
            executedTrigger = true;
        }

        return executedTrigger;
    }

    private shouldExecuteTrigger(trigger: ActionTrigger, verb: string): boolean {
        if (trigger.verb !== verb) return false;

        if (trigger.conditions) {
            return this.conditionVerifier.verifyConditions(trigger.conditions);
        }

        return true;
    }

    private async executeTriggerAction(action: CommandAction) {
        const command = this.commandFactory.create(action.command, action.argument);
        if (!command) return false;

        const params = [action.argument, action.parameter].filter(isDefined);
        const result = await command.execute(params, { caller: 'triggerAction' });

        this.displayActionResultMessage(action, result);
    }

    private displayActionResultMessage(action: CommandAction, result: boolean) {
        const message = result ? action.responses?.success : action.responses?.failure;
        if (!message) return;

        this.ui.displayMessage(this.game.getTextWithAudioFiles(message));
    }
}
