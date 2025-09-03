import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Customer } from '../../../domain/entities/customer.entity';
import { LedgerEntryType } from '../../../domain/ledger.types';
import { UnitOfWork } from '../../../domain/ports/unit-of-work.port';
import { DepositUseCase } from '../deposit.uc';

describe('DepositUseCase', () => {
    let useCase: DepositUseCase;
    let mockUnitOfWork: jest.Mocked<UnitOfWork>;
    let mockCustomerRepo: any;
    let mockLedgerRepo: any;

    const mockCustomer = new Customer(
        1,
        'John Doe',
        '12345678901',
        'john@example.com',
        100000,
        1,
        new Date(),
        new Date(),
    );

    beforeEach(async () => {
        mockCustomerRepo = {
            findById: jest.fn(),
            updateBalanceWithVersion: jest.fn(),
        };

        mockLedgerRepo = {
            findByIdempotencyKey: jest.fn(),
            createEntry: jest.fn(),
        };

        mockUnitOfWork = {
            withTransaction: jest.fn(),
        } as jest.Mocked<UnitOfWork>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DepositUseCase,
                { provide: UnitOfWork, useValue: mockUnitOfWork },
            ],
        }).compile();

        useCase = module.get<DepositUseCase>(DepositUseCase);
    });

    describe('execute', () => {
        it('should successfully deposit money', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: 300.25, // Depositar R$ 300,25
                idempotencyKey: 'k-123',
            };

            const expectedNewBalance = 100000 + 30025; // R$ 1000,00 + R$ 300,25 = R$ 1300,25

            const updatedCustomer = {
                id: 1,
                balanceCents: expectedNewBalance, // R$ 1300,25 em centavos
                version: 2, // Versão incrementada
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) =>
                fn({ customers: mockCustomerRepo, ledger: mockLedgerRepo }),
            );

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue({
                id: 1,
                balanceCents: 100000, // Saldo inicial R$ 1000,00
                version: 1,
            });
            mockLedgerRepo.createEntry.mockResolvedValue({ id: 'ledger-123' });
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(
                updatedCustomer,
            );

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockLedgerRepo.createEntry).toHaveBeenCalledWith({
                customerId: 1,
                deltaCents: 30025, // R$ 300,25 em centavos (POSITIVO para depósito)
                type: LedgerEntryType.DEPOSIT,
                idempotencyKey: 'k-123',
            });

            expect(
                mockCustomerRepo.updateBalanceWithVersion,
            ).toHaveBeenCalledWith({
                id: 1,
                currentVersion: 1,
                nextBalanceCents: expectedNewBalance, // Novo saldo R$ 1300,25
            });

            expect(result).toEqual({
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            });
        });

        it('should handle idempotency - return existing customer if key exists', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: '500.50', // String amount
                idempotencyKey: 'duplicate-key',
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue({
                id: 'existing-entry', // Operação já existe
            });
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result).toBe(mockCustomer);
            expect(mockLedgerRepo.createEntry).not.toHaveBeenCalled();
            expect(
                mockCustomerRepo.updateBalanceWithVersion,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for negative amount', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: -100, // Valor negativo
            };

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new BadRequestException('Amount must be positive'),
            );
        });

        it('should throw BadRequestException for zero amount', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: 0, // Valor zero
            };

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new BadRequestException('Amount must be positive'),
            );
        });

        it('should throw BadRequestException for negative string amount', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: '-50.25', // String negativa
            };

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new BadRequestException('Amount must be positive'),
            );
        });

        it('should throw NotFoundException when customer not found', async () => {
            // Arrange
            const input = {
                customerId: 999,
                amount: 100,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new NotFoundException('Customer not found'),
            );
        });

        it('should handle concurrent modification', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: 100,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
            mockLedgerRepo.createEntry.mockResolvedValue({ id: 'ledger-123' });
            // Simula falha por versão desatualizada (concurrent modification)
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new BadRequestException(
                    'Concurrent modification, please retry',
                ),
            );
        });

        it('should parse string amount correctly', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: '250.75',
            };

            const expectedNewBalance = 100000 + 25075; // R$ 1000,00 + R$ 250,75 = R$ 1250,75
            const updatedCustomer = {
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
            mockLedgerRepo.createEntry.mockResolvedValue({ id: 'ledger-123' });
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(
                updatedCustomer,
            );

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockLedgerRepo.createEntry).toHaveBeenCalledWith({
                customerId: 1,
                deltaCents: 25075, // R$ 250,75 em centavos (POSITIVO)
                type: LedgerEntryType.DEPOSIT,
                idempotencyKey: null, // Sem idempotency key neste caso
            });

            expect(
                mockCustomerRepo.updateBalanceWithVersion,
            ).toHaveBeenCalledWith({
                id: 1,
                currentVersion: 1,
                nextBalanceCents: expectedNewBalance,
            });

            expect(result).toEqual({
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            });
        });

        it('should handle deposit with comma as decimal separator', async () => {
            // Arrange - testando formato brasileiro R$ 150,50
            const input = {
                customerId: 1,
                amount: '150,50', // Vírgula como separador decimal
            };

            const expectedNewBalance = 100000 + 15050; // R$ 1000,00 + R$ 150,50 = R$ 1150,50
            const updatedCustomer = {
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
            mockLedgerRepo.createEntry.mockResolvedValue({ id: 'ledger-123' });
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(
                updatedCustomer,
            );

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockLedgerRepo.createEntry).toHaveBeenCalledWith({
                customerId: 1,
                deltaCents: 15050, // R$ 150,50 em centavos
                type: LedgerEntryType.DEPOSIT,
                idempotencyKey: null,
            });
        });

        it('should handle large deposit amount', async () => {
            // Arrange - depósito grande R$ 5000,00
            const input = {
                customerId: 1,
                amount: 5000.0,
            };

            const expectedNewBalance = 100000 + 500000; // R$ 1000,00 + R$ 5000,00 = R$ 6000,00
            const updatedCustomer = {
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
            mockLedgerRepo.createEntry.mockResolvedValue({ id: 'ledger-123' });
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(
                updatedCustomer,
            );

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockLedgerRepo.createEntry).toHaveBeenCalledWith({
                customerId: 1,
                deltaCents: 500000, // R$ 5000,00 em centavos
                type: LedgerEntryType.DEPOSIT,
                idempotencyKey: null,
            });

            expect(result?.balanceCents).toBe(600000); // R$ 6000,00 em centavos
        });

        it('should handle minimal deposit amount (1 centavo)', async () => {
            // Arrange - depósito mínimo R$ 0,01
            const input = {
                customerId: 1,
                amount: 0.01,
            };

            const expectedNewBalance = 100000 + 1; // R$ 1000,00 + R$ 0,01 = R$ 1000,01
            const updatedCustomer = {
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
            mockLedgerRepo.createEntry.mockResolvedValue({ id: 'ledger-123' });
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(
                updatedCustomer,
            );

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(mockLedgerRepo.createEntry).toHaveBeenCalledWith({
                customerId: 1,
                deltaCents: 1, // 1 centavo
                type: LedgerEntryType.DEPOSIT,
                idempotencyKey: null,
            });

            expect(result?.balanceCents).toBe(100001); // R$ 1000,01 em centavos
        });
    });
});
