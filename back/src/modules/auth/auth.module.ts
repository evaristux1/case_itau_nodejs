import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '@app/shared/infrastructure/prisma/prisma.module';
import { JwtStrategy } from '@app/shared/security/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        PrismaModule,

        PassportModule.register({ defaultStrategy: 'jwt' }),

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                secret:
                    cfg.get<string>('security.jwt.secret') ??
                    cfg.get<string>('JWT_SECRET') ??
                    'dev-secret',
                signOptions: {
                    expiresIn:
                        cfg.get<string>('security.jwt.expiresIn') ??
                        cfg.get<string>('JWT_EXPIRES_IN') ??
                        '1h',
                    issuer:
                        cfg.get<string>('security.jwt.issuer') ?? 'itau-api',
                    audience:
                        cfg.get<string>('security.jwt.audience') ??
                        'itau-clients',
                    algorithm: 'HS256',
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
