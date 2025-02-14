import { Condition, CountableItem, Game } from '@katas/katacombs/domain';

export class ConditionVerifier {
    constructor(private readonly game: Game) {}

    public verifyConditions(conditions: Condition[]): boolean {
        const checkConditions = conditions.map((condition) => this.verifyCondition(condition));
        return checkConditions.every((value) => value);
    }

    public verifyCondition(condition: Condition): boolean {
        if (condition.type === 'location' && condition.key === 'currentLocation') {
            const currentRoom = this.game.getCurrentRoom();
            return currentRoom.getName() === condition.value;
        }
        if (condition.type === 'hasState') {
            return this.game.findItem(condition.key)?.getCurrentState() === condition.value;
        }
        if (condition.type === 'hasItem') {
            const item = this.game.findItemInInventory(condition.key);
            if (!item) return false;

            if (item instanceof CountableItem && condition.value) {
                const count = parseInt(condition.value);
                if (item.getCount() < count) return false;
            }

            return true;
        }

        return false;
    }
}
