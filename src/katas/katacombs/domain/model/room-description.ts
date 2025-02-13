export class RoomDescription {
    private readonly long: string;
    private readonly short: string | undefined;

    constructor(long: string, short?: string) {
        this.long = long;
        this.short = short;
    }

    public getDescription(numberOfVisits: number, preferredLength?: 'short' | 'long'): string {
        if (preferredLength === 'long') return this.getLongDescription();
        if (preferredLength === 'short') return this.getShortDescription();

        return numberOfVisits > 1 ? this.getShortDescription() : this.getLongDescription();
    }

    private getLongDescription(): string {
        return this.long;
    }

    private getShortDescription(): string {
        return this.short ?? this.long;
    }
}
