import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpfFormat',
  standalone: true,
})
export class CpfFormatPipe implements PipeTransform {
  transform(cpf: string | null | undefined): string {
    if (!cpf) return '';

    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
