import { Command } from '@katas/katacombs/commands';
import { Game, isChoiceDialog, TextWithAudioFiles } from '@katas/katacombs/domain';
import { UserInterface } from '@katas/katacombs/ui';
import { isDefined } from '@utils/array';

export class TalkCommand extends Command {
    constructor(
        private readonly game: Game,
        private readonly ui: UserInterface,
    ) {
        super();
    }

    async execute(params: string[]): Promise<boolean> {
        const npcName = params[0];
        const npc = this.game.getCurrentRoom().findNpc(npcName);
        if (!npc) return false;

        const welcomeText = this.game.getTextWithAudioFiles(npc.greeting);

        await this.ui.displayMessageAsync(welcomeText);

        const dialog = npc.dialogs.find((dialog) => (dialog.id = 'start'));
        if (!dialog) return false;

        const questions: string[] = [];
        if (dialog.text) {
            questions.push(dialog.text);
        }
        if (isChoiceDialog(dialog)) {
            const dialogsFromChoice = dialog.choices
                .map((choice) => npc.dialogs.find((dialog) => dialog.id === choice))
                .filter(isDefined)
                .filter((dialog) => dialog.enabled);
            const questionsFromChoice = dialogsFromChoice.map((dialog) => dialog.text).filter(isDefined);
            questions.push(...questionsFromChoice);
        }
        const text = '\n- ' + questions.join('\n- ');

        this.ui.displayMessage(new TextWithAudioFiles(text, []));

        return true;
    }
}
