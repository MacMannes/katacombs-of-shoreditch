import { ActionTrigger, StatefulItemDescription, ItemIdentifier, ActionTriggers } from '@katas/katacombs/domain';
import { ItemVisibility } from '@katas/katacombs/domain/model/item-visibility';

export class Item {
    private readonly _immovable: boolean;

    private readonly identifier: ItemIdentifier;
    private readonly description: StatefulItemDescription;
    private readonly visibility: ItemVisibility;
    private readonly triggers: ActionTriggers;

    constructor(name: string, options: ItemOptions) {
        this.identifier = new ItemIdentifier(name, options.synonyms);
        this.description = new StatefulItemDescription(options.description, options.states, options.initialState);

        this.visibility = new ItemVisibility(options.visible ?? true);
        this._immovable = options.immovable ?? false;
        this.triggers = new ActionTriggers(options.triggers);
    }

    public get immovable(): boolean {
        return this._immovable;
    }

    public get name(): string {
        return this.identifier.getName();
    }

    public getDescription(context: keyof ContextualItemDescription): string[] {
        return this.description.getDescription(context);
    }

    public getCurrentState(): string | undefined {
        return this.description.currentState;
    }

    public setState(newState: string) {
        this.description.setState(newState);
    }

    public getTriggers(verb?: string): ActionTrigger[] {
        return this.triggers.getTriggers(verb);
    }

    public isVisible(): boolean {
        return this.visibility.isVisible();
    }

    public reveal() {
        this.visibility.reveal();
    }

    public hide() {
        this.visibility.hide();
    }

    public matches(word: string): boolean {
        return this.identifier.matches(word);
    }

    public equals(other: Item): boolean {
        return this.name === other.name;
    }
}

export type ContextualItemDescription = {
    inventory: string;
    room: string;
    look: string;
};

export type ItemOptions = {
    description: ContextualItemDescription;
    synonyms?: string[];
    visible?: boolean; // Visibility of the item. Default: true;
    immovable?: boolean; // Immovable objects can't be taken. Default: false;
    states?: Record<string, ContextualItemDescription>;
    initialState?: string;
    triggers?: ActionTrigger[];
};
