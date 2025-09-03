// src/modules/customers/customers.module.ts
import { PrismaModule } from '@app/shared/infrastructure/prisma/prisma.module';
import { Module } from '@nestjs/common';

import { CustomersController } from './presentation/http/customers.controller';

import { CreateCustomerUseCase } from './application/use-cases/create-customer.uc';
import { DepositUseCase } from './application/use-cases/deposit.uc';
import { GetCustomerUseCase } from './application/use-cases/get-customer.uc';
import { ListCustomersUseCase } from './application/use-cases/list-customers.uc';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.uc';
import { WithdrawUseCase } from './application/use-cases/withdraw.uc';

import { PrismaCustomerRepository } from './infra/prisma-customer.repository';
import { PrismaLedgerRepository } from './infra/prisma-ledger.repository';
import { PrismaUnitOfWork } from './infra/prisma-unit-of-work';

import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.uc';
import { CustomerRepository } from './domain/ports/customer.repository';
import { LedgerRepository } from './domain/ports/ledger.repository';
import { UnitOfWork } from './domain/ports/unit-of-work.port';

@Module({
    imports: [PrismaModule],
    controllers: [CustomersController],
    providers: [
        CreateCustomerUseCase,
        UpdateCustomerUseCase,
        GetCustomerUseCase,
        ListCustomersUseCase,
        DepositUseCase,
        WithdrawUseCase,
        DeleteCustomerUseCase,
        PrismaCustomerRepository,
        PrismaLedgerRepository,
        PrismaUnitOfWork,
        { provide: CustomerRepository, useClass: PrismaCustomerRepository },
        { provide: LedgerRepository, useClass: PrismaLedgerRepository },
        { provide: UnitOfWork, useClass: PrismaUnitOfWork },
    ],
    exports: [
        CreateCustomerUseCase,
        UpdateCustomerUseCase,
        GetCustomerUseCase,
        ListCustomersUseCase,
        DepositUseCase,
        WithdrawUseCase,
    ],
})
export class CustomersModule {}
