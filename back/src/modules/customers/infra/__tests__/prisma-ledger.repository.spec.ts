import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { LedgerEntryType } from '../../domain/ledger.types';
import { PrismaLedgerRepository } from '../prisma-ledger.repository';
describe('PrismaLedgerRepository', () => {
    let repository: PrismaLedgerRepository;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrisma = {
            ledgerEntry: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrismaLedgerRepository,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        repository = module.get<PrismaLedgerRepository>(PrismaLedgerRepository);
        prisma = module.get(PrismaService);
    });

    describe('findByIdempotencyKey', () => {
        it('should find entry by idempotency key', async () => {
            // Arrange
            const mockEntry = {
                id: 'entry-123',
                customerId: 1,
                deltaCents: 100,
                type: 'DEPOSIT',
                idempotencyKey: 'test-key',
                balanceBeforeCents: null,
                balanceAfterCents: null,
                description: null,
                metadata: null,
                transactionId: null,
                createdAt: new Date(),
            };
            prisma.ledgerEntry.findUnique.mockResolvedValue(mockEntry);

            // Act
            const result = await repository.findByIdempotencyKey('test-key');

            // Assert
            expect(prisma.ledgerEntry.findUnique).toHaveBeenCalledWith({
                where: { idempotencyKey: 'test-key' },
            });
            expect(result).toBe(mockEntry);
        });

        it('should return null when entry not found', async () => {
            // Arrange
            prisma.ledgerEntry.findUnique.mockResolvedValue(null);

            // Act
            const result =
                await repository.findByIdempotencyKey('non-existent');

            // Assert
            expect(result).toBeNull();
        });
    });

    it('createEntry', async () => {
        prisma.ledgerEntry.create.mockResolvedValue({ id: 'led-1' } as any);

        const res = await repository.createEntry({
            customerId: 1,
            deltaCents: 500,
            type: LedgerEntryType.DEPOSIT,
            idempotencyKey: 'key-1',
            description: 'desc',
            metadata: { source: 'api' },
        });

        expect(prisma.ledgerEntry.create).toHaveBeenCalledWith({
            data: {
                customerId: 1,
                deltaCents: 500,
                type: LedgerEntryType.DEPOSIT,
                idempotencyKey: 'key-1',
                balanceBeforeCents: null,
                balanceAfterCents: null,
                description: 'desc',
                metadata: JSON.stringify({ source: 'api' }),
            },
            select: { id: true },
        });
        expect(res.id).toBe('led-1');
    });
});
