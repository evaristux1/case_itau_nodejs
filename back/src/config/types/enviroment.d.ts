import { EnvConfig } from '../env.schema';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}

export {};
