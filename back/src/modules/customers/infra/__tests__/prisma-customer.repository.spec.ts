import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaCustomerRepository } from '../prisma-customer.repository';
describe('PrismaCustomerRepository', () => {
    let repository: PrismaCustomerRepository;
    let prisma: jest.Mocked<PrismaService>;

    const mockPrismaCustomer = {
        id: 1,
        name: 'John Doe',
        document: '12345678901',
        email: 'john@example.com',
        balanceCents: 100000,
        passwordHash: 'hashed-password',
        version: 1,
        status: 'ACTIVE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
    };

    beforeEach(async () => {
        const mockPrisma = {
            customer: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrismaCustomerRepository,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        repository = module.get<PrismaCustomerRepository>(
            PrismaCustomerRepository,
        );
        prisma = module.get(PrismaService);
    });

    describe('create', () => {
        it('should create a customer', async () => {
            // Arrange
            const createData = {
                name: 'John Doe',
                email: 'john@example.com',
                document: '12345678901',
                passwordHash: 'hashed-password',
            };

            prisma.customer.create.mockResolvedValue(mockPrismaCustomer);

            // Act
            const result = await repository.create(createData);

            // Assert
            expect(prisma.customer.create).toHaveBeenCalledWith({
                data: createData,
            });
            expect(result.id).toBe(1);
            expect(result.name).toBe('John Doe');
            expect(result.balanceCents).toBe(100000);
        });
    });

    describe('findById', () => {
        it('should find a customer by id', async () => {
            // Arrange
            prisma.customer.findUnique.mockResolvedValue(mockPrismaCustomer);

            // Act
            const result = await repository.findById(1);

            // Assert
            expect(prisma.customer.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result?.id).toBe(1);
            expect(result?.name).toBe('John Doe');
        });

        it('should return null when customer not found', async () => {
            // Arrange
            prisma.customer.findUnique.mockResolvedValue(null);

            // Act
            const result = await repository.findById(999);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('updateBalanceWithVersion', () => {
        it('should update balance with version control', async () => {
            // Arrange
            const params = {
                id: 1,
                currentVersion: 1,
                nextBalanceCents: 150000,
            };

            const updatedCustomer = {
                ...mockPrismaCustomer,
                balanceCents: 150000,
                version: 2,
            };

            prisma.customer.update.mockResolvedValue(updatedCustomer);

            // Act
            const result = await repository.updateBalanceWithVersion(params);

            // Assert
            expect(prisma.customer.update).toHaveBeenCalledWith({
                where: {
                    id_version: {
                        id: 1,
                        version: 1,
                    },
                },
                data: {
                    balanceCents: 150000,
                    version: { increment: 1 },
                },
            });
            expect(result?.balanceCents).toBe(150000);
            expect(result?.version).toBe(2);
        });

        it('should return null on concurrent modification', async () => {
            // Arrange
            const params = {
                id: 1,
                currentVersion: 1,
                nextBalanceCents: 150000,
            };

            // Simula erro do Prisma por versão desatualizada
            prisma.customer.update.mockRejectedValue(
                new Error('Record not found'),
            );

            // Act
            const result = await repository.updateBalanceWithVersion(params);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('list', () => {
        it('should list all customers', async () => {
            // Arrange
            const customers = [mockPrismaCustomer];
            prisma.customer.findMany.mockResolvedValue(customers);

            // Act
            const result = await repository.list();

            // Assert
            expect(prisma.customer.findMany).toHaveBeenCalledWith({
                orderBy: { id: 'asc' },
            });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John Doe');
        });
    });
});
