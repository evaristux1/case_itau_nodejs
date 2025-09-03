import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class IdempotencyKeyGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        const key = req.headers['idempotency-key'];
        if (!key) throw new BadRequestException('Missing Idempotency-Key');
        return true;
    }
}
