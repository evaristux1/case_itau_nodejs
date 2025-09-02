import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
    ThrottlerGuard,
    ThrottlerModule,
    ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ConfigurationModule } from './config/configuration.module';
import { CustomersModule } from './modules/customers/customers.module';
import { HealthModule } from './modules/health/health.module';
import { AllExceptionsFilter } from './shared/infrastructure/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/infrastructure/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/infrastructure/interceptors/transform.interceptor';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { SharedModule } from './shared/shared.module';

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
        HealthModule,
        PrismaModule,
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
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    ],
})
export class AppModule {}
