import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logging/app-logger.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { PasswordHasherService } from './security/password-hasher.service';
import { DocumentService } from './validations/document.validation';

@Global()
@Module({
    providers: [
        AppLoggerService,
        MonitoringService,
        PasswordHasherService,
        DocumentService,
    ],
    exports: [
        AppLoggerService,
        MonitoringService,
        PasswordHasherService,
        DocumentService,
    ],
})
export class SharedModule {}
