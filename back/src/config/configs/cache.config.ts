import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
    enabled: process.env.CACHE_ENABLED === true,

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        keyPrefix: 'itau:',
        ttl: process.env.CACHE_TTL || 300,

        retryStrategy: (times: number) => Math.min(times * 50, 2000),
        reconnectOnError: (err: Error) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                return true;
            }
            return false;
        },
    },

    keys: {
        customer: (id: string) => `customer:${id}`,
        customerList: (page: number, limit: number) =>
            `customers:${page}:${limit}`,
        transaction: (id: string) => `transaction:${id}`,
        metrics: 'metrics:global',
    },
}));
