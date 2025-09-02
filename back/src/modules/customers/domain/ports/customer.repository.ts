// src/modules/customers/domain/ports/customer.repository.ts
import { Customer } from '../entities/customer.entity';

export abstract class CustomerRepository {
    abstract create(data: {
        name: string;
        email: string;
        document: string;
        passwordHash: string;
    }): Promise<Customer>;

    abstract update(
        id: number,
        data: { name?: string; email?: string },
    ): Promise<Customer>;
    abstract delete(id: number): Promise<void>;
    abstract findById(id: number): Promise<Customer | null>;
    abstract list(): Promise<Customer[]>;

    abstract updateBalanceWithVersion(params: {
        id: number;
        currentVersion: number;
        nextBalanceCents: number;
    }): Promise<Customer | null>;
}
