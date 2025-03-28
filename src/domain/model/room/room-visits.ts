export class RoomVisits {
    private numberOfVisits = 0;

    public getPreferredTextLength(): 'short' | 'long' {
        return this.numberOfVisits > 1 ? 'short' : 'long';
    }

    public addVisit(): number {
        return this.numberOfVisits++;
    }
}
