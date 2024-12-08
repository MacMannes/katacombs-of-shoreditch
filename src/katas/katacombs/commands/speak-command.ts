import { Command } from '@katas/katacombs/commands';
import { UserInterface } from '@katas/katacombs/ui';

export class SpeakCommand extends Command {
    constructor(private readonly ui: UserInterface) {
        super({ isInternal: true });
    }

    execute(params: string[]): boolean {
        return false;
    }
}
