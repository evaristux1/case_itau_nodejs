import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(cfg: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey:
                cfg.get<string>('security.jwt.secret') ??
                cfg.get<string>('JWT_SECRET') ??
                'dev-secret',
            ignoreExpiration: false,
            issuer: cfg.get<string>('security.jwt.issuer') ?? 'itau-api',
            audience:
                cfg.get<string>('security.jwt.audience') ?? 'itau-clients',
            algorithms: ['HS256'],
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email };
    }
}
