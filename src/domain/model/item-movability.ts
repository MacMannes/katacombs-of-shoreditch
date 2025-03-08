export type Movability = 'movable' | 'immovable';

export class ItemMovability {
    constructor(private readonly movability: Movability) {}

    public isMovable(): boolean {
        return this.movability === 'movable';
    }
}
