// src/modules/customers/application/dto/create-customer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Ana Maria Silva', maxLength: 120 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    name!: string;

    @ApiProperty({ example: 'ana.silva@example.com' })
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    email!: string;

    @ApiProperty({
        description: 'Documento do cliente (CPF somente dígitos)',
        example: '12345678909',
        minLength: 11,
        maxLength: 11,
    })
    @IsString()
    @Length(11, 11)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    document!: string;

    @ApiProperty({
        description: 'Senha em texto puro (será hasheada)',
        minLength: 8,
    })
    @IsString()
    @Length(8, 128)
    password!: string;
}
