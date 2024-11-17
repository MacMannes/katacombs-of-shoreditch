import { ActionTrigger } from '@katas/katacombs/domain';

export class Item {
    public readonly description: Description;
    public readonly visible: boolean;
    public readonly immovable: boolean;
    public readonly states?: Record<string, Description>;
    public readonly triggers?: ActionTrigger[];

    private currentState?: string;

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

    public getDescription(context: keyof Description): string {
        const baseDescription = this.description[context];
        const stateDescription = this.currentState ? this.states?.[this.currentState]?.[context] : undefined;
        return stateDescription ? `${baseDescription} ${stateDescription}` : baseDescription;
    }

    public getCurrentState(): string | undefined {
        return this.currentState;
    }

    public setState(newState: string) {
        if (!this.states || !Object.keys(this.states).includes(newState)) return;

        this.currentState = newState;
    }

    public matches(word: string): boolean {
        return this.name === word || this.words.includes(word);
    }
}

type Description = {
    inventory: string;
    room: string;
    look: string;
};

type ItemOptions = {
    description: Description;
    words?: string[];
    visible?: boolean; // Visibility of the item. Default: true;
    immovable?: boolean; // Immovable objects can't be taken. Default: false;
    states?: Record<string, Description>;
    initialState?: string;
    triggers?: ActionTrigger[];
};
