import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const provider = process.env.DATABASE_PROVIDER || 'sqlite';

  return {
    provider,
    url: process.env.DATABASE_URL,
    logging: process.env.DATABASE_LOGGING === true,
    synchronize: process.env.DATABASE_SYNCHRONIZE === true,

    // Provider-specific configurations
    sqlite: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },

    postgresql: {
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === true,
      poolSize: process.env.DATABASE_POOL_SIZE || 10,
      // Additional PostgreSQL specific options
      options: {
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 10000,
      },
    },

    mysql: {
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === true,
      poolSize: process.env.DATABASE_POOL_SIZE || 10,
    },

    // Migration settings
    migrations: {
      directory: './prisma/migrations',
      tableName: '_migrations',
    },
  };
});
