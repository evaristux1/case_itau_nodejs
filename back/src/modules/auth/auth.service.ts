// src/modules/auth/auth.service.ts
import { PrismaService } from '@app/shared/infrastructure/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) {}

    async issueTokenByEmail(email: string) {
        const normalized = email.trim().toLowerCase();

        const customer = await this.prisma.customer.findFirst({
            where: {
                email: normalized,
                deletedAt: null,
            },
            select: { id: true, email: true },
        });

        if (!customer) {
            throw new BadRequestException('Invalid email');
        }

        const payload = { sub: customer.id, email: customer.email };
        const access_token = await this.jwt.signAsync(payload);
        return { access_token };
    }
}
