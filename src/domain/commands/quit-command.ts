import type { UserInterface } from 'src/ui/user-interface.ts';
import { Command } from 'src/domain/commands/command.ts';

export class QuitCommand extends Command {
    constructor(private readonly ui: UserInterface) {
        super({ requiresTarget: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(params: string[]): Promise<boolean> {
        //TODO: Ask if user really wants to quit
        return true;
    }
}
