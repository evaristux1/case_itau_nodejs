import { describe, expect, it } from '@jest/globals';
import { Money, parseMoneyToCents } from '../money.vo';
describe('Money Value Object', () => {
    describe('parseMoneyToCents', () => {
        it('should parse number correctly', () => {
            expect(parseMoneyToCents(150.75)).toBe(15075);
            expect(parseMoneyToCents(0.01)).toBe(1);
            expect(parseMoneyToCents(1000)).toBe(100000);
        });

        it('should parse string correctly', () => {
            expect(parseMoneyToCents('150.75')).toBe(15075);
            expect(parseMoneyToCents('0.01')).toBe(1);
            expect(parseMoneyToCents('1000')).toBe(100000);
            expect(parseMoneyToCents('1000.00')).toBe(100000);
        });

        it('should handle comma as decimal separator', () => {
            expect(parseMoneyToCents('150,75')).toBe(15075);
        });

        it('should handle negative values', () => {
            expect(parseMoneyToCents(-150.75)).toBe(-15075);
            expect(parseMoneyToCents('-150.75')).toBe(-15075);
        });

        it('should throw for invalid formats', () => {
            expect(() => parseMoneyToCents('abc')).toThrow(
                'Invalid money format',
            );
            expect(() => parseMoneyToCents('150.759')).toThrow(
                'Invalid money format',
            ); // mais de 2 casas decimais
            expect(() => parseMoneyToCents('150..75')).toThrow(
                'Invalid money format',
            );
        });
    });

    describe('Money class', () => {
        it('should create from cents', () => {
            const money = Money.fromCents(15075);
            expect(money.value()).toBe(15075);
        });

        it('should create from number/string', () => {
            const money1 = Money.from(150.75);
            const money2 = Money.from('150.75');

            expect(money1.value()).toBe(15075);
            expect(money2.value()).toBe(15075);
        });

        it('should throw for non-integer cents', () => {
            expect(() => Money.fromCents(150.5)).toThrow(
                'cents must be integer',
            );
        });
    });
});
