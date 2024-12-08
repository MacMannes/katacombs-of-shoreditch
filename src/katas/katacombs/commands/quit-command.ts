import { Command } from '@katas/katacombs/commands';
import { UserInterface } from '@katas/katacombs/ui';

export class QuitCommand extends Command {
    constructor(private readonly ui: UserInterface) {
        super({ requiresTarget: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(params: string[]): boolean {
        //TODO: Ask if user really wants to quit
        return true;
    }
}
