import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
    private readonly logger: winston.Logger;

    constructor(private readonly config: ConfigService) {
        const m = this.config.get<any>('monitoring');
        const level = m?.logging?.level ?? 'info';
        const fmt =
            m?.logging?.format === 'json'
                ? winston.format.json()
                : winston.format.simple();

        const transports: winston.transport[] = [];
        if (m?.logging?.transports?.console?.enabled) {
            transports.push(new winston.transports.Console({ level }));
        }
        if (m?.logging?.transports?.file?.enabled) {
            transports.push(
                new winston.transports.File({
                    level,
                    filename: m.logging.transports.file.filename,
                    maxsize: m.logging.transports.file.maxsize,
                    maxFiles: m.logging.transports.file.maxFiles,
                }),
            );
        }
        if (m?.logging?.transports?.errorFile?.enabled) {
            transports.push(
                new winston.transports.File({
                    level: 'error',
                    filename: m.logging.transports.errorFile.filename,
                }),
            );
        }

        this.logger = winston.createLogger({
            level,
            format: winston.format.combine(winston.format.timestamp(), fmt),
            defaultMeta: { service: 'api' },
            transports,
        });
    }

    log(message: any, context?: string) {
        this.logger.info(message, { context });
    }
    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, { trace, context });
    }
    warn(message: any, context?: string) {
        this.logger.warn(message, { context });
    }
    debug(message: any, context?: string) {
        this.logger.debug(message, { context });
    }
    verbose(message: any, context?: string) {
        this.logger.verbose(message, { context });
    }
}
