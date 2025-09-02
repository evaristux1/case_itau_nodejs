// src/config/configuration.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './configs/app.config';
import cacheConfig from './configs/cache.config';
import databaseConfig from './configs/database.config';
import monitoringConfig from './configs/monitoring.config';
import securityConfig from './configs/security.config';
import configuration from './configuration';
import { validateEnv } from './env.schema';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}.local`,
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env.local',
        '.env',
      ],
      load: [
        configuration,
        appConfig,
        databaseConfig,
        securityConfig,
        cacheConfig,
        monitoringConfig,
      ],
      validate: (raw) => validateEnv(raw),
    }),
  ],
})
export class ConfigurationModule {}
