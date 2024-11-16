export class Item {
    public readonly description: Description;
    public readonly visible: boolean;
    public readonly immovable: boolean;
    public readonly states?: string[];

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
            this.currentState = options.initialState ?? options.states.at(0);
        }
    }

    public getDescription(context: 'room' | 'inventory' | 'look'): string {
        return this.description[context];
    }

    public getCurrentState(): string | undefined {
        return this.currentState;
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
    states?: string[];
    initialState?: string;
};
