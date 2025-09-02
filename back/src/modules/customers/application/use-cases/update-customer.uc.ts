import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitOfWork } from '../../domain/ports/unit-of-work.port';

@Injectable()
export class UpdateCustomerUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(id: number, input: { name?: string; email?: string }) {
        return this.uow.withTransaction(async ({ customers }) => {
            const found = await customers.findById(id);
            if (!found) throw new NotFoundException('Customer not found');
            return customers.update(id, input);
        });
    }
}
