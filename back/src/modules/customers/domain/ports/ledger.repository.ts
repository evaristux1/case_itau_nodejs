import { LedgerEntryType } from '../ledger.types';

export abstract class LedgerRepository {
    abstract findByIdempotencyKey(key: string): Promise<{ id: string } | null>;

    abstract createEntry(params: {
        customerId: number;
        deltaCents: number;
        type: LedgerEntryType;
        idempotencyKey?: string | null;
    }): Promise<{ id: string }>;
}
