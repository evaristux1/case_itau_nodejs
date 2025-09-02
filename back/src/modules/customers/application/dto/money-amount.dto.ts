import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, IsString, ValidateIf } from 'class-validator';

export class MoneyAmountDto {
    @ApiPropertyOptional({
        description: 'Valor numérico em unidades (ex.: 150.75)',
        example: 150.75,
    })
    @ValidateIf((o) => o.amountStr === undefined)
    @Transform(({ value }) =>
        typeof value === 'string' ? Number(value) : value,
    )
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    amount?: number;

    @ApiPropertyOptional({
        description:
            'Valor em string (ex.: "150.75"). Usado se `amount` não for enviado.',
        example: '150.75',
    })
    @ValidateIf((o) => o.amount === undefined)
    @IsString()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    amountStr?: string;
}
