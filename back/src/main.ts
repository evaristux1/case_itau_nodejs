import { AppModule } from '@app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import 'module-alias/register';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    // Error handlers
    process.on('uncaughtException', (err) => {
        logger.error('FATAL uncaughtException:', err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
        logger.error('FATAL unhandledRejection:', reason);
        process.exit(1);
    });

    logger.log('Creating Nest application…');
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    // Configuration
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const apiPrefix = 'api/v1';
    const apiVersion = configService.get<string>('API_VERSION', '1.0.0');
    const port = configService.get<number>('PORT', 3000);
    const host = configService.get<string>('HOST', '0.0.0.0');
    const swaggerEnabled = configService.get<string>(
        'FEATURE_SWAGGER_ENABLED',
        'true',
    );

    const corsOrigins = (
        configService?.get<string[]>('CORS_ORIGINS', [
            'http://localhost:3000',
        ]) ?? ['http://localhost:3000']
    ).map((origin) => origin.trim());
    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
        }),
    );

    app.use(compression());

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.setGlobalPrefix(apiPrefix);

    if (swaggerEnabled && nodeEnv !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Itaú Customer API')
            .setDescription(
                'High-performance customer management API with financial operations',
            )
            .setVersion(apiVersion)
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token',
            })
            .addApiKey({
                type: 'apiKey',
                name: 'X-API-Key',
                in: 'header',
                description: 'API Key for external services',
            })
            .addServer(`http://localhost:${port}`, 'Local Development')
            .addServer('https://api-staging.itau.com', 'Staging')
            .addServer('https://api.itau.com', 'Production')
            .build();

        const document = SwaggerModule.createDocument(app, config);

        SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
                filter: true,
                showRequestDuration: true,
                syntaxHighlight: {
                    activate: true,
                    theme: 'monokai',
                },
                tryItOutEnabled: true,
                requestInterceptor: (req: any) => {
                    return req;
                },
            },
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Itaú API Documentation',
            customfavIcon: 'https://www.itau.com.br/favicon.ico',
        });

        logger.log(
            `📚 Swagger documentation available at: http://localhost:${port}/${apiPrefix}/docs`,
        );
    }

    // Start listening
    await app.listen(port, host);

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    logger.log(`📍 API Prefix: /${apiPrefix}`);
    logger.log(`🔗 API Endpoints: http://localhost:${port}/${apiPrefix}`);

    if (swaggerEnabled && nodeEnv !== 'production') {
        logger.log(
            `📖 API Documentation: http://localhost:${port}/${apiPrefix}/docs`,
        );
        logger.log(
            `📄 OpenAPI JSON: http://localhost:${port}/${apiPrefix}/docs-json`,
        );
        logger.log(
            `📄 OpenAPI YAML: http://localhost:${port}/${apiPrefix}/docs-yaml`,
        );
    }

    // List all registered routes (for debugging)
    const server = app.getHttpServer();
    const router = server._events.request._router;

    if (router) {
        const availableRoutes: string[] = router.stack
            .filter((layer: any) => layer.route)
            .map((layer: any) => {
                const path = layer.route?.path;
                const method = layer.route?.stack[0].method?.toUpperCase();
                return `${method} ${path}`;
            });

        logger.log('📋 Registered routes:');
        availableRoutes.forEach((route) => logger.log(`   ${route}`));
    }

    app.enableShutdownHooks();

    const shutdown = async (signal: string) => {
        logger.log(`${signal} received, shutting down gracefully…`);
        await app.close();
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
    console.error('Fatal error during bootstrap:', err);
    process.exit(1);
});
