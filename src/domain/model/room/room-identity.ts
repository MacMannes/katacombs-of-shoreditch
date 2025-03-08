export class RoomIdentity {
    constructor(
        private readonly name: string,
        private readonly title: string,
    ) {}

    public getName(): string {
        return this.name;
    }

    public getTitle(): string {
        return this.title;
    }
}
