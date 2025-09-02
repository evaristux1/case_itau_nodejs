import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHasherService {
    private readonly rounds: number;

    constructor(cfg: ConfigService) {
        this.rounds = Number(cfg.get('BCRYPT_ROUNDS') ?? 12);
    }

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.rounds);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
