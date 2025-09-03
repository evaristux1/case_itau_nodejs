import { Injectable, NotFoundException } from '@nestjs/common';
import { UnitOfWork } from '../../domain/ports/unit-of-work.port';

@Injectable()
export class DeleteCustomerUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute(id: number): Promise<void> {
        return this.uow.withTransaction(async ({ customers }) => {
            const found = await customers.findById(id);

            if (!found) {
                throw new NotFoundException('Customer not found');
            }

            await customers.delete(id);
        });
    }
}
