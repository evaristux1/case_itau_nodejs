import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        issuer: 'itau-api',
        audience: 'itau-clients',
    },

    encryption: {
        key: process.env.ENCRYPTION_KEY,
        algorithm: 'aes-256-gcm',
    },

    bcrypt: {
        rounds: process.env.BCRYPT_ROUNDS || 12,
    },

    apiKey: {
        header: process.env.API_KEY_HEADER || 'X-API-Key',
    },

    csp: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },

    // Security headers
    headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
}));
