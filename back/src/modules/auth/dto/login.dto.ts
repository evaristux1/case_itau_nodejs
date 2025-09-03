import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'ana.silva@example.com' })
    @IsEmail()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    email!: string;
}
