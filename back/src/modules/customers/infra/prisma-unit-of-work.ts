// src/modules/customers/infra/prisma-unit-of-work.ts
import { PrismaService } from '@app/shared/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../domain/ports/unit-of-work.port';
import { PrismaCustomerRepository } from './prisma-customer.repository';
import { PrismaLedgerRepository } from './prisma-ledger.repository';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
    constructor(private readonly prisma: PrismaService) {}

    async withTransaction<T>(
        work: (repos: {
            customers: PrismaCustomerRepository;
            ledger: PrismaLedgerRepository;
        }) => Promise<T>,
    ): Promise<T> {
        return this.prisma.$transaction(async (tx) => {
            const customers = new PrismaCustomerRepository(tx as any);
            const ledger = new PrismaLedgerRepository(tx as any);
            return work({ customers, ledger });
        });
    }
}
