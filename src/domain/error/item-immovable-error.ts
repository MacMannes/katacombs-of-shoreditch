export class ItemImmovableError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'ItemImmovable';
    }
}
