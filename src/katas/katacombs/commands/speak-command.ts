import { Command, CommandExecuteOptions } from '@katas/katacombs/commands';
import { UserInterface } from '@katas/katacombs/ui';

export class SpeakCommand extends Command {
    constructor(private readonly ui: UserInterface) {
        super({ isInternal: true });
    }

    async execute(options?: CommandExecuteOptions): Promise<boolean> {
        return false;
    }
}
