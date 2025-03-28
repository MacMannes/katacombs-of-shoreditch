import type { UserInterface } from 'src/ui/user-interface.ts';
import { isDefined } from 'src/utils/array/array-utils.ts';
import { CommandFactory } from 'src/domain/commands/command-factory.ts';
import type { ActionTrigger } from 'src/domain/model/action-trigger.ts';
import type { CommandAction } from 'src/domain/model/command-action.ts';
import { ConditionVerifier } from 'src/domain/model/condition-verifier.ts';
import type { Game } from 'src/domain/model/game/game.ts';

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

    public async execute(
        target: string | undefined,
        verb: string,
    ): Promise<boolean> {
        const targetItem = target ? this.game.findItem(target) : undefined;
        if (!targetItem) return false;

        const triggers = targetItem
            .getTriggers(verb)
            .filter((trigger) => this.shouldExecuteTrigger(trigger));
        if (triggers.length == 0) return false;

        const actions = triggers.flatMap((trigger) => trigger.actions);
        let executedTrigger = false;
        for await (const action of actions) {
            await this.executeCommandAction(action);
            executedTrigger = true;
        }

        return executedTrigger;
    }

    private shouldExecuteTrigger(trigger: ActionTrigger): boolean {
        if (trigger.conditions) {
            return this.conditionVerifier.verifyConditions(trigger.conditions);
        }

        return true;
    }

    public async executeCommandAction(action: CommandAction) {
        const command = this.commandFactory.create({
            verb: action.command,
            target: action.argument,
            allowInternalCommands: true,
        });
        if (!command) return false;

        const params = [action.argument, action.parameter].filter(isDefined);
        const result = await command.execute(params, {
            caller: 'triggerAction',
        });

        this.displayActionResultMessage(action, result);
    }

    private displayActionResultMessage(action: CommandAction, result: boolean) {
        const message = result
            ? action.responses?.success
            : action.responses?.failure;
        if (!message) return;

        this.ui.displayMessage(this.game.getTextWithAudioFiles(message));
    }
}
