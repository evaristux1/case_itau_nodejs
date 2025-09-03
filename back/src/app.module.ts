import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
    ThrottlerGuard,
    ThrottlerModule,
    ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ConfigurationModule } from './config/configuration.module';
import { GlobalAuthGuard } from './guards/global-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CustomersModule } from './modules/customers/customers.module';
import { AllExceptionsFilter } from './shared/infrastructure/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/infrastructure/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/infrastructure/interceptors/transform.interceptor';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { JwtStrategy } from './shared/security/jwt.strategy';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        ConfigurationModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigurationModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
                throttlers: [
                    {
                        name: 'global',
                        ttl: Number(config.get('app.rateLimit.ttl') ?? 60_000),
                        limit: Number(config.get('app.rateLimit.limit') ?? 100),
                    },
                ],
                errorMessage: 'Too many requests',
            }),
        }),
        SharedModule,
        CustomersModule,
        PrismaModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        },
        JwtStrategy,
        JwtAuthGuard,
        { provide: APP_GUARD, useClass: GlobalAuthGuard },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    ],
})
export class AppModule {}
