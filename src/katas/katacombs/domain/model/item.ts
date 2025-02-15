import { ActionTrigger, ItemIdentifier } from '@katas/katacombs/domain';
import { isDefined } from '@utils/array';

export class Item {
    private readonly _immovable: boolean;
    private readonly states?: Record<string, ContextualItemDescription>;
    private readonly description: ContextualItemDescription;
    public readonly triggers?: ActionTrigger[];

    protected currentState?: string;
    private visible: boolean;

    private readonly identifier: ItemIdentifier;

    constructor(name: string, options: ItemOptions) {
        this.identifier = new ItemIdentifier(name, options.synonyms);

        this.description = options.description;
        this.visible = options.visible ?? true;
        this._immovable = options.immovable ?? false;
        if (options.states) {
            this.states = options.states;
            this.currentState = options.initialState ?? Object.keys(options.states).at(0);
        }
        this.triggers = options.triggers;
    }

    public get immovable(): boolean {
        return this._immovable;
    }

    public get name(): string {
        return this.identifier.getName();
    }

    public getDescription(context: keyof ContextualItemDescription): string[] {
        const baseDescription = this.description[context];
        const stateDescription = this.currentState ? this.states?.[this.currentState]?.[context] : undefined;

        return [baseDescription, stateDescription].filter(isDefined);
    }

    public getCurrentState(): string | undefined {
        return this.currentState;
    }

    public setState(newState: string) {
        if (!this.states || !Object.keys(this.states).includes(newState)) return;

        this.currentState = newState;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public reveal() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
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
