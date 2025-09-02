// src/modules/customers/domain/ports/unit-of-work.port.ts
import { CustomerRepository } from './customer.repository';
import { LedgerRepository } from './ledger.repository';

export abstract class UnitOfWork {
    abstract withTransaction<T>(
        work: (repos: {
            customers: CustomerRepository;
            ledger: LedgerRepository;
        }) => Promise<T>,
    ): Promise<T>;
}
