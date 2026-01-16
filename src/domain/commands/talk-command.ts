import type { UserInterface } from 'src/ui/user-interface.ts';
import { DialogManager } from 'src/domain/model/dialog-manager.ts';
import type { Game } from 'src/domain/model/game/game.ts';
import type { NPC } from 'src/domain/model/npc.ts';
import { Command } from 'src/domain/commands/command.ts';

export class TalkCommand extends Command {
    private readonly dialogManager: DialogManager;

    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
        this.dialogManager = new DialogManager(this.game, this.ui);
    }

    async execute(params: string[]): Promise<boolean> {
        const npcName = params[0];
        if (!npcName) return false;

        const npc = this.findNpc(npcName);
        if (!npc) {
            this.displayLonelyMessage();
            return false;
        }

        this.displayGreeting(npc);
        await this.dialogManager.startConversation(npc);

        return true;
    }

    private findNpc(npcName: string): NPC | undefined {
        return this.game.getCurrentRoom().findNpc(npcName);
    }

    private displayLonelyMessage(): void {
        const response = this.game.getTextWithAudioFiles('msg-lonely-out-here');
        this.ui.displayMessage(response);
    }

    private displayGreeting(npc: NPC): void {
        const greeting = this.game.getTextWithAudioFiles(npc.greeting);
        this.ui.displayMessage(greeting);
    }
}
