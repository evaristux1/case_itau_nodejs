// src/modules/customers/infra/prisma-customer.repository.ts
import { PrismaService } from '@app/shared/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Customer } from '../domain/entities/customer.entity';

import { Customer as PrismaCustomer } from '@prisma/client';

function mapCustomer(row: PrismaCustomer): Customer {
    return new Customer(
        row.id,
        row.name,
        row.document,
        row.email,
        Number(row.balanceCents),
        row.version,
        row.createdAt,
        row.updatedAt,
    );
}

@Injectable()
export class PrismaCustomerRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        name: string;
        email: string;
        document: string;
        passwordHash: string;
    }): Promise<Customer> {
        const row = await this.prisma.customer.create({
            data: {
                name: data.name,
                email: data.email,
                document: data.document,
                passwordHash: data.passwordHash,
            },
        });
        return mapCustomer(row);
    }

    async update(
        id: number,
        data: { name?: string; email?: string },
    ): Promise<Customer> {
        const row = await this.prisma.customer.update({ where: { id }, data });
        return mapCustomer(row);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.customer.delete({ where: { id } });
    }

    async findById(id: number): Promise<Customer | null> {
        const row = await this.prisma.customer.findUnique({ where: { id } });
        return row ? mapCustomer(row) : null;
    }

    async list(): Promise<Customer[]> {
        const rows = await this.prisma.customer.findMany({
            orderBy: { id: 'asc' },
        });
        return rows.map(mapCustomer);
    }

    async updateBalanceWithVersion(params: {
        id: number;
        currentVersion: number;
        nextBalanceCents: number;
    }): Promise<Customer | null> {
        try {
            const row = await this.prisma.customer.update({
                where: {
                    // Prisma usa o NOME DO SELETOR gerado = campos concatenados:
                    id_version: {
                        id: params.id,
                        version: params.currentVersion,
                    },
                },
                data: {
                    balanceCents: params.nextBalanceCents,
                    version: { increment: 1 },
                },
            });
            return mapCustomer(row);
        } catch {
            // Se não achou (versão mudou), Prisma lança erro → retorna null
            return null;
        }
    }
}
