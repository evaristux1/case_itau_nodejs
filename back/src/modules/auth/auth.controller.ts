// src/modules/auth/presentation/http/auth.controller.ts
import { Public } from '@app/decorators/public.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticação *')
@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Post('token')
    @ApiOperation({ summary: 'Gerar token JWT a partir do e-mail' })
    @ApiBody({
        description: 'Email do usuário para autenticação',
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
            },
        },
    })
    @ApiOkResponse({
        description: 'Token JWT gerado',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
        },
    })
    async token(@Body() dto: LoginDto) {
        return this.auth.issueTokenByEmail(dto.email);
    }
}
