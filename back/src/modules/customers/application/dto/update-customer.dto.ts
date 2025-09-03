import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';

export class UpdateCustomerDto {
    @ApiPropertyOptional({
        description: 'Novo nome do cliente',
        example: 'Ana M. Silva',
        maxLength: 120,
    })
    @IsString()
    @IsOptional()
    @MaxLength(120)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    name?: string;

    @ApiPropertyOptional({
        description: 'Novo e-mail do cliente',
        example: 'ana.ms@example.com',
    })
    @IsEmail()
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    email?: string;

    @IsString()
    @IsOptional()
    @Length(11, 11)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    document?: string;
}
