export class Money {
    private constructor(private readonly cents: number) {}

    static fromCents(cents: number): Money {
        if (!Number.isInteger(cents)) throw new Error('cents must be integer');
        return new Money(cents);
    }

    static from(input: number | string): Money {
        const cents = parseMoneyToCents(input);
        return new Money(cents);
    }

    value(): number {
        return this.cents;
    }
}

export function parseMoneyToCents(input: number | string): number {
    if (typeof input === 'number') {
        return Math.round(Number(input.toFixed(2)) * 100);
    }
    const s = String(input).trim().replace(',', '.');
    if (!/^-?\d+(\.\d{0,2})?$/.test(s)) {
        throw new Error('Invalid money format');
    }
    const [intPart, decPart = ''] = s.split('.');
    const padded = (decPart + '00').slice(0, 2);
    const cents =
        parseInt(intPart, 10) * 100 +
        parseInt(padded || '0', 10) * (intPart.startsWith('-') ? -1 : 1);
    return cents;
}
