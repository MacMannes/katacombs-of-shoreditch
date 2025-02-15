export class ItemVisibility {
    private visible: boolean;

    constructor(visible: boolean) {
        this.visible = visible;
    }

    public reveal() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    public isVisible(): boolean {
        return this.visible;
    }
}
