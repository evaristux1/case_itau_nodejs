import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitOfWork } from '../../domain/ports/unit-of-work.port';

@Injectable()
export class GetCustomerUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(id: number) {
        return this.uow.withTransaction(async ({ customers }) => {
            const c = await customers.findById(id);
            if (!c) throw new NotFoundException('Customer not found');
            return c;
        });
    }
}
