import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../domain/ports/unit-of-work.port';

@Injectable()
export class ListCustomersUseCase {
    constructor(private readonly uow: UnitOfWork) {}

    async execute() {
        return this.uow.withTransaction(async ({ customers }) =>
            customers.list(),
        );
    }
}
