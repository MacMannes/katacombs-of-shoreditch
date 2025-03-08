import { describe, expect, it } from 'vitest';
import { ATM } from '@katas/atm';

/**
 * Nominal values 10, 20, 50, 100, 200 and 500 dollars.
 */

describe('ATM Machine Kata', () => {
    const atm = new ATM();

    describe('Withdrawing something outside of the boundaries', () => {
        it('should return -1 when amount is less than 10', () => {
            expect(atm.withdraw(9)).toBe(-1);
        });

        it('should return -1 when amount is negative', () => {
            expect(atm.withdraw(-1)).toBe(-1);
        });

        it('should return -1 when amount greater than 1500', () => {
            expect(atm.withdraw(1501)).toBe(-1);
        });
    });

    describe('Withdrawing one of the nominal values', () => {
        it('should return 1 when 10 is withdrawn', () => {
            expect(atm.withdraw(10)).toBe(1);
        });

        it('should return 1 when 20 is withdrawn', () => {
            expect(atm.withdraw(20)).toBe(1);
        });

        it('should return 1 when 100 is withdrawn', () => {
            expect(atm.withdraw(100)).toBe(1);
        });

        it('should return 1 when 50 is withdrawn', () => {
            expect(atm.withdraw(50)).toBe(1);
        });

        it('should return 1 when 200 is withdrawn', () => {
            expect(atm.withdraw(200)).toBe(1);
        });

        it('should return 1 when 500 is withdrawn', () => {
            expect(atm.withdraw(500)).toBe(1);
        });
    });

    describe('Withdrawing invalid notes', () => {
        it('should return -1 when amount is 5', () => {
            expect(atm.withdraw(5)).toBe(-1);
        });

        it('should return -1 when amount is 25', () => {
            expect(atm.withdraw(25)).toBe(-1);
        });
    });

    describe('Withdrawing a multiple notes of the same value', () => {
        it('should return 3 when amount is 1500', () => {
            expect(atm.withdraw(1500)).toBe(3);
        });

        it('should return 2 when amount is 1000', () => {
            expect(atm.withdraw(1000)).toBe(2);
        });

        it('should return 2 when amount is 400', () => {
            expect(atm.withdraw(400)).toBe(2);
        });
    });

    describe('Withdrawing multiple notes', () => {
        it('should return 4 when amount is 400', () => {
            expect(atm.withdraw(1400)).toBe(4); // 2 * 500 + 2 * 200
        });

        it('should return 3 when amount is 560', () => {
            expect(atm.withdraw(560)).toBe(3); // 1 * 500 + 1 * 50 + 1 * 10
        });

        it('should return 2 when amount is 300', () => {
            expect(atm.withdraw(300)).toBe(2); // 1 * 200 + 1 * 100
        });

        it('should return 6 when amount is 880', () => {
            expect(atm.withdraw(880)).toBe(6); // All the nominal values
        });
    });
});
