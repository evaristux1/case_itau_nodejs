export type LedgerType = 'DEPOSIT' | 'WITHDRAW';

export abstract class LedgerRepository {
    abstract findByIdempotencyKey(key: string): Promise<{ id: string } | null>;

    abstract createEntry(params: {
        customerId: number;
        deltaCents: number;
        type: LedgerType;
        idempotencyKey?: string | null;
    }): Promise<{ id: string }>;
}
