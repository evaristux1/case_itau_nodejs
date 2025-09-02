// jest.config.ts
import type { Config } from 'jest';

const alias = {
  '^@app/(.*)$': '<rootDir>/src/$1',
  '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  '^@config/(.*)$': '<rootDir>/src/config/$1',
  '^@modules/(.*)$': '<rootDir>/src/modules/$1',
};

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      testRegex: '.*\\.spec\\.ts$',
      setupFiles: ['tsconfig-paths/register'],
      moduleNameMapper: alias,
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>',
      testRegex: '.e2e-spec.ts$',
      setupFiles: ['tsconfig-paths/register'],
      moduleNameMapper: alias,
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
    },
  ],
};

export default config;
