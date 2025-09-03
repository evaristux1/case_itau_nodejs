import { beforeEach, describe, expect, it } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { DocumentService } from '../document.validation';

describe('DocumentService', () => {
    let service: DocumentService;

    beforeEach(() => {
        service = new DocumentService();
    });

    describe('sanitize', () => {
        it('should remove non-digit characters', () => {
            expect(service.sanitize('123.456.789-09')).toBe('12345678909');
            expect(service.sanitize('123 456 789 09')).toBe('12345678909');
            expect(service.sanitize('abc123def456ghi')).toBe('123456');
        });
    });

    describe('assertCPF', () => {
        it('should accept valid CPF', () => {
            expect(() => service.assertCPF('11144477735')).not.toThrow();
        });

        it('should reject invalid CPF', () => {
            expect(() => service.assertCPF('12345678900')).toThrow(
                new BadRequestException('Invalid document (CPF)'),
            );
            expect(() => service.assertCPF('11111111111')).toThrow();
            expect(() => service.assertCPF('123456789')).toThrow();
        });
    });
});
