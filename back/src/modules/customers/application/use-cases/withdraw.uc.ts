import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { LedgerEntryType } from '../../domain/ledger.types';
import { UnitOfWork } from '../../domain/ports/unit-of-work.port';
import { Money, parseMoneyToCents } from '../../domain/value-objects/money.vo';

@Injectable()
export class WithdrawUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(input: {
        customerId: number;
        amount: number | string;
        idempotencyKey?: string;
    }) {
        const cents =
            typeof input.amount === 'string'
                ? parseMoneyToCents(input.amount)
                : Money.from(input.amount).value();
        if (cents <= 0)
            throw new BadRequestException('Amount must be positive');
        return this.uow.withTransaction(async ({ customers, ledger }) => {
            if (input.idempotencyKey) {
                const existing = await ledger.findByIdempotencyKey(
                    input.idempotencyKey,
                );
                if (existing) return customers.findById(input.customerId);
            }

            const current = await customers.findById(input.customerId);
            if (!current) throw new NotFoundException('Customer not found');

            const nextBalance = current.balanceCents - cents;
            if (nextBalance < 0)
                throw new BadRequestException('Insufficient funds');

            await ledger.createEntry({
                customerId: input.customerId,
                deltaCents: -cents,
                type: LedgerEntryType.WITHDRAW,
                idempotencyKey: input.idempotencyKey ?? null,
            });

            const updated = await customers.updateBalanceWithVersion({
                id: current.id,
                currentVersion: current.version,
                nextBalanceCents: nextBalance,
            });
            if (!updated)
                throw new BadRequestException(
                    'Concurrent modification, please retry',
                );

            return {
                id: updated.id,
                balanceCents: updated.balanceCents,
                version: updated.version,
            };
        });
    }
}
