import { ActionTrigger, CommandAction, Condition, Game } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import { CommandFactory } from '@katas/katacombs/commands';
import { isDefined } from '@utils/array';

export class ActionTriggerExecutor {
    private readonly commandFactory: CommandFactory;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        this.commandFactory = new CommandFactory(this.game, this.ui);
    }

    public execute(target: string | undefined, verb: string): boolean {
        let executedTrigger = false;

        const targetItem = target ? this.game.findItem(target) : undefined;
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
}
