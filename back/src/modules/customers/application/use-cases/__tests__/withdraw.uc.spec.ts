import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Customer } from '../../../domain/entities/customer.entity';
import { LedgerEntryType } from '../../../domain/ledger.types';
import { UnitOfWork } from '../../../domain/ports/unit-of-work.port';
import { WithdrawUseCase } from '../withdraw.uc';

describe('WithdrawUseCase', () => {
    let useCase: WithdrawUseCase;
    let mockUnitOfWork: jest.Mocked<UnitOfWork>;
    let mockCustomerRepo: any;
    let mockLedgerRepo: any;

    const mockCustomer = new Customer(
        1,
        'John Doe',
        '12345678901',
        'john@example.com',
        100000, // R$ 1000,00 em centavos (saldo inicial)
        1,
        new Date('2025-09-02T20:04:13.013Z'),
        new Date('2025-09-02T20:04:13.013Z'),
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
                WithdrawUseCase,
                { provide: UnitOfWork, useValue: mockUnitOfWork },
            ],
        }).compile();

        useCase = module.get<WithdrawUseCase>(WithdrawUseCase);
    });

    describe('execute', () => {
        it('should successfully withdraw money', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: 300.25, // Sacar R$ 300,25
                idempotencyKey: 'withdraw-key-123',
            };

            const expectedNewBalance = 100000 - 30025; // R$ 1000,00 - R$ 300,25 = R$ 699,75

            // O que o repository vai retornar (Customer completo atualizado)
            const updatedCustomerFromRepo = new Customer(
                1,
                'John Doe',
                '12345678901',
                'john@example.com',
                expectedNewBalance, // Novo saldo
                2, // Versão incrementada
                new Date('2025-09-02T20:04:13.013Z'),
                new Date('2025-09-02T20:04:13.013Z'),
            );

            // O que o use case vai retornar (objeto simplificado)
            const expectedResult = {
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) =>
                fn({ customers: mockCustomerRepo, ledger: mockLedgerRepo }),
            );

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue({
                id: 1,
                balanceCents: 100000, // Saldo inicial
                version: 1,
            });
            mockLedgerRepo.createEntry.mockResolvedValue({
                id: 'ledger-withdraw-123',
            });
            mockCustomerRepo.updateBalanceWithVersion.mockResolvedValue(
                updatedCustomerFromRepo,
            );

            // Act
            const result = await useCase.execute(input);

            // Assert - Verificar chamadas
            expect(mockLedgerRepo.createEntry).toHaveBeenCalledWith({
                customerId: 1,
                deltaCents: -30025, // R$ -300,25 em centavos (NEGATIVO para saque)
                type: LedgerEntryType.WITHDRAW,
                idempotencyKey: 'withdraw-key-123',
            });

            expect(
                mockCustomerRepo.updateBalanceWithVersion,
            ).toHaveBeenCalledWith({
                id: 1,
                currentVersion: 1,
                nextBalanceCents: expectedNewBalance,
            });

            expect(result).toEqual(expectedResult);
            expect(result?.balanceCents).toBe(69975);
        });

        it('should throw BadRequestException for insufficient funds', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: 2000,
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new BadRequestException('Insufficient funds'),
            );

            // Verificar que nenhuma operação foi executada
            expect(mockLedgerRepo.createEntry).not.toHaveBeenCalled();
            expect(
                mockCustomerRepo.updateBalanceWithVersion,
            ).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for negative amount', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: -50.25,
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
                amount: 0,
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
                amount: 150.75,
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
                amount: '150.25', // String que deve ser parseada
            };

            const expectedNewBalance = 100000 - 15025; // R$ 1000,00 - R$ 150,25 = R$ 849,75
            const updatedCustomer = new Customer(
                1,
                'John Doe',
                '12345678901',
                'john@example.com',
                expectedNewBalance,
                2,
                new Date('2025-09-02T20:04:13.013Z'),
                new Date('2025-09-02T20:04:13.013Z'),
            );

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
                deltaCents: -15025, // R$ -150,25 em centavos (NEGATIVO para saque)
                type: LedgerEntryType.WITHDRAW,
                idempotencyKey: null,
            });

            expect(result).toEqual({
                id: 1,
                balanceCents: expectedNewBalance,
                version: 2,
            });
        });

        it('should handle withdrawal with comma as decimal separator', async () => {
            // Arrange
            const input = {
                customerId: 1,
                amount: '99,99', // Vírgula como separador decimal
            };

            const expectedNewBalance = 100000 - 9999; // R$ 1000,00 - R$ 99,99 = R$ 900,01
            const updatedCustomer = new Customer(
                1,
                'John Doe',
                '12345678901',
                'john@example.com',
                expectedNewBalance,
                2,
                new Date('2025-09-02T20:04:13.013Z'),
                new Date('2025-09-02T20:04:13.013Z'),
            );

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
                deltaCents: -9999, // R$ -99,99 em centavos
                type: LedgerEntryType.WITHDRAW,
                idempotencyKey: null,
            });

            expect(result?.balanceCents).toBe(90001); // R$ 900,01 em centavos
        });

        it('should fail withdrawal when trying to withdraw more than available by 1 cent', async () => {
            const input = {
                customerId: 1,
                amount: 1000.01, // R$ 1000,01 (saldo é R$ 1000,00)
            };

            mockUnitOfWork.withTransaction.mockImplementation(async (fn) => {
                return fn({
                    customers: mockCustomerRepo,
                    ledger: mockLedgerRepo,
                });
            });

            mockLedgerRepo.findByIdempotencyKey.mockResolvedValue(null);
            mockCustomerRepo.findById.mockResolvedValue(mockCustomer);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(
                new BadRequestException('Insufficient funds'),
            );

            // Verificar que nenhuma operação foi executada
            expect(mockLedgerRepo.createEntry).not.toHaveBeenCalled();
            expect(
                mockCustomerRepo.updateBalanceWithVersion,
            ).not.toHaveBeenCalled();
        });
    });
});
