import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class MoneyAmountDto {
    @ApiProperty({
        example: '150.75',
        description: 'Valor monetário com até 2 casas.',
    })
    @IsString()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'amount deve ter no máx. 2 casas decimais',
    })
    amount!: string;
}
