import { IS_PUBLIC_KEY } from '@app/decorators/public.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwt: JwtAuthGuard,
    ) {}
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) return true;
        return this.jwt.canActivate(context) as boolean;
    }
}
