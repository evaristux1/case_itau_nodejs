import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseMoneyToCentsPipe implements PipeTransform {
    transform(value: any) {
        const raw =
            typeof value === 'string' ? value.trim() : (value?.amount ?? value);
        if (raw === undefined || raw === null) {
            throw new BadRequestException('amount is required');
        }
        const str = String(raw);
        if (!/^\d+(\.\d{1,2})?$/.test(str)) {
            throw new BadRequestException(
                'amount must be a number with up to 2 decimals',
            );
        }
        const [intPart, decPart = ''] = str.split('.');
        const cents = Number(intPart) * 100 + Number(decPart.padEnd(2, '0'));
        return { amountCents: cents };
    }
}
