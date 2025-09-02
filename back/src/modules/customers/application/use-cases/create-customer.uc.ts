// src/modules/customers/application/use-cases/create-customer.uc.ts
import { PasswordHasherService } from '@app/shared/security/password-hasher.service';
import { DocumentService } from '@app/shared/validations/document.validation';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../domain/ports/unit-of-work.port';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Injectable()
export class CreateCustomerUseCase {
    constructor(
        private readonly uow: UnitOfWork,
        private readonly hasher: PasswordHasherService,
        private readonly documents: DocumentService,
    ) {}

    async execute(input: CreateCustomerDto) {
        const name = input.name?.trim();
        const email = input.email?.trim();
        const document = this.documents.sanitize(input.document);

        if (!name || !email) {
            throw new BadRequestException('Invalid payload (name/email)');
        }
        this.documents.assertCPF(document);

        const passwordHash = await this.hasher.hash(input.password);

        return this.uow.withTransaction(async ({ customers }) => {
            return customers.create({ name, email, document, passwordHash });
        });
    }
}
