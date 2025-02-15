import { ContextualItemDescription } from '@katas/katacombs/domain';
import { isDefined } from '@utils/array';

export class StatefulItemDescription {
    private readonly description: ContextualItemDescription;
    private readonly states?: Record<string, ContextualItemDescription>;
    private _currentState?: string;

    constructor(
        description: ContextualItemDescription,
        states?: Record<string, ContextualItemDescription>,
        initialState?: string,
    ) {
        this.states = states;
        this.description = description;
        if (states) {
            this._currentState = initialState ?? Object.keys(states).at(0);
        }
    }

    public getDescription(context: keyof ContextualItemDescription): string[] {
        const baseDescription = this.description[context];
        const stateDescription = this._currentState ? this.states?.[this._currentState]?.[context] : undefined;

        return [baseDescription, stateDescription].filter(isDefined);
    }

    get currentState(): string | undefined {
        return this._currentState;
    }

    public setState(newState: string) {
        if (!this.states || !Object.keys(this.states).includes(newState)) return;

        this._currentState = newState;
    }
}
