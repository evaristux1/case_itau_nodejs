import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from '../../../application/use-cases/create-customer.uc';
import { DeleteCustomerUseCase } from '../../../application/use-cases/delete-customer.uc';
import { DepositUseCase } from '../../../application/use-cases/deposit.uc';
import { GetCustomerUseCase } from '../../../application/use-cases/get-customer.uc';
import { ListCustomersUseCase } from '../../../application/use-cases/list-customers.uc';
import { UpdateCustomerUseCase } from '../../../application/use-cases/update-customer.uc';
import { WithdrawUseCase } from '../../../application/use-cases/withdraw.uc';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomersController } from '../customers.controller';

describe('CustomersController', () => {
    let controller: CustomersController;
    let createCustomerUseCase: jest.Mocked<CreateCustomerUseCase>;
    let depositUseCase: jest.Mocked<DepositUseCase>;
    let withdrawUseCase: jest.Mocked<WithdrawUseCase>;
    let getCustomerUseCase: jest.Mocked<GetCustomerUseCase>;
    let listCustomersUseCase: jest.Mocked<ListCustomersUseCase>;
    let updateCustomerUseCase: jest.Mocked<UpdateCustomerUseCase>;

    const mockCustomer = new Customer(
        1,
        'John Doe',
        '12345678901',
        'john@example.com',
        100000,
        1,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
    );

    beforeEach(async () => {
        const mockUseCases = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CustomersController],
            providers: [
                { provide: CreateCustomerUseCase, useValue: mockUseCases },
                { provide: DepositUseCase, useValue: mockUseCases },
                { provide: WithdrawUseCase, useValue: mockUseCases },
                { provide: DeleteCustomerUseCase, useValue: mockUseCases },
                { provide: GetCustomerUseCase, useValue: mockUseCases },
                { provide: ListCustomersUseCase, useValue: mockUseCases },
                { provide: UpdateCustomerUseCase, useValue: mockUseCases },
            ],
        }).compile();

        controller = module.get<CustomersController>(CustomersController);
        createCustomerUseCase = module.get(CreateCustomerUseCase);
        depositUseCase = module.get(DepositUseCase);
        withdrawUseCase = module.get(WithdrawUseCase);
        getCustomerUseCase = module.get(GetCustomerUseCase);
        listCustomersUseCase = module.get(ListCustomersUseCase);
        updateCustomerUseCase = module.get(UpdateCustomerUseCase);
    });

    describe('create', () => {
        it('should create a customer', async () => {
            // Arrange
            const createDto = {
                name: 'John Doe',
                email: 'john@example.com',
                document: '12345678901',
                password: 'securePassword123',
            };

            createCustomerUseCase.execute.mockResolvedValue(mockCustomer);

            // Act
            const result = await controller.create(createDto);

            // Assert
            expect(result).toBe(mockCustomer);
            expect(createCustomerUseCase.execute).toHaveBeenCalledWith(
                createDto,
            );
        });
    });

    describe('get', () => {
        it('should get a customer by id', async () => {
            // Arrange
            getCustomerUseCase.execute.mockResolvedValue(mockCustomer);

            // Act
            const result = await controller.get(1);

            // Assert
            expect(result).toBe(mockCustomer);
            expect(getCustomerUseCase.execute).toHaveBeenCalledWith(1);
        });
    });

    describe('list', () => {
        it('should list all customers', async () => {
            // Arrange
            const customers = [mockCustomer];
            listCustomersUseCase.execute.mockResolvedValue(customers);

            // Act
            const result = await controller.list();

            // Assert
            expect(result).toBe(customers);
            expect(listCustomersUseCase.execute).toHaveBeenCalled();
        });
    });

    describe('depositar', () => {
        it('should deposit money with numeric amount', async () => {
            // Arrange
            const updatedCustomer = new Customer(
                1,
                'John Doe',
                '12345678901',
                'john@example.com',
                150000,
                2,
                new Date(),
                new Date(),
            );

            const dto = { amountCents: 500 };
            const idempotencyKey = 'test-key-123';

            depositUseCase.execute.mockResolvedValue(updatedCustomer);

            // Act
            const result = await controller.depositar(1, dto, idempotencyKey);

            // Assert
            expect(result).toBe(updatedCustomer);
            expect(depositUseCase.execute).toHaveBeenCalledWith({
                customerId: 1,
                amount: 500,
                idempotencyKey: 'test-key-123',
            });
        });
    });

    describe('sacar', () => {
        it('should withdraw money', async () => {
            // Arrange
            const updatedCustomer = new Customer(
                1,
                'John Doe',
                '12345678901',
                'john@example.com',
                50000,
                2,
                new Date(),
                new Date(),
            );

            const dto = { amountCents: 500 };

            withdrawUseCase.execute.mockResolvedValue(updatedCustomer);

            const result = await controller.sacar(1, dto, undefined);

            expect(result).toBe(updatedCustomer);
            expect(withdrawUseCase.execute).toHaveBeenCalledWith({
                customerId: 1,
                amount: 500,
                idempotencyKey: undefined,
            });
        });
    });

    describe('update', () => {
        it('should update a customer', async () => {
            const updateDto = {
                name: 'John Updated',
                email: 'john.updated@example.com',
            };

            const updatedCustomer = new Customer(
                1,
                'John Updated',
                '12345678901',
                'john.updated@example.com',
                100000,
                1,
                new Date(),
                new Date(),
            );

            updateCustomerUseCase.execute.mockResolvedValue(updatedCustomer);

            const result = await controller.update(1, updateDto);

            // Assert
            expect(result).toBe(updatedCustomer);
            expect(updateCustomerUseCase.execute).toHaveBeenCalledWith(
                1,
                updateDto,
            );
        });
    });

    describe('remove', () => {
        it('should return ok (placeholder)', async () => {
            const result = await controller.remove(1);

            expect(result).toEqual({ success: true });
        });
    });
});
