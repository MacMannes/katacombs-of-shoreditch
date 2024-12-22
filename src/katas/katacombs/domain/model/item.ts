import { ActionTrigger } from '@katas/katacombs/domain';
import { isDefined } from '@utils/array';

export class Item {
    public readonly description: ItemDescription;
    public readonly immovable: boolean;
    public readonly states?: Record<string, ItemDescription>;
    public readonly triggers?: ActionTrigger[];

    private currentState?: string;
    private visible: boolean;

    private readonly words: string[] = [];

    constructor(
        readonly name: string,
        readonly options: ItemOptions,
    ) {
        this.description = options.description;
        if (options.words) this.words.push(...options.words);
        this.visible = options.visible ?? true;
        this.immovable = options.immovable ?? false;
        if (options.states) {
            this.states = options.states;
            this.currentState = options.initialState ?? Object.keys(options.states).at(0);
        }
        this.triggers = options.triggers;
    }

    public getDescription(context: keyof ItemDescription): string[] {
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
        return this.name === word || this.words.includes(word);
    }
}

export type ItemDescription = {
    inventory: string;
    room: string;
    look: string;
};

export type ItemOptions = {
    description: ItemDescription;
    words?: string[];
    visible?: boolean; // Visibility of the item. Default: true;
    immovable?: boolean; // Immovable objects can't be taken. Default: false;
    states?: Record<string, ItemDescription>;
    initialState?: string;
    triggers?: ActionTrigger[];
};
