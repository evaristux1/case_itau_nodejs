// src/shared/validation/document.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { isValidCPF, onlyDigits } from '../utils/cpf.utils';

@Injectable()
export class DocumentService {
    sanitize(doc: string): string {
        return onlyDigits(doc);
    }

    assertCPF(doc: string) {
        if (!isValidCPF(doc)) {
            throw new BadRequestException('Invalid document (CPF)');
        }
    }
}
