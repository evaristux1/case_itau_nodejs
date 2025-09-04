// src/modules/customers/infra/prisma-ledger.repository.ts
import { PrismaService } from '@app/shared/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LedgerEntryType } from '../domain/ledger.types';
import { LedgerRepository } from '../domain/ports/ledger.repository';

@Injectable()
export class PrismaLedgerRepository implements LedgerRepository {
    constructor(private readonly prisma: PrismaService) {}

    findByIdempotencyKey(key: string) {
        return this.prisma.ledgerEntry.findUnique({
            where: { idempotencyKey: key },
        });
    }

    async createEntry(params: {
        customerId: number;
        deltaCents: number;
        type: LedgerEntryType;
        idempotencyKey?: string | null;
        balanceBeforeCents?: number | null;
        balanceAfterCents?: number | null;
        description?: string | null;
        metadata?: unknown;
    }) {
        const row = await this.prisma.ledgerEntry.create({
            data: {
                customerId: params.customerId,
                deltaCents: params.deltaCents,
                type: params.type as any,
                idempotencyKey: params.idempotencyKey ?? null,
                balanceBeforeCents: params.balanceBeforeCents ?? null,
                balanceAfterCents: params.balanceAfterCents ?? null,
                description: params.description ?? null,
                metadata: params.metadata
                    ? JSON.stringify(params.metadata)
                    : null,
            },
            select: { id: true },
        });
        return row;
    }
}
