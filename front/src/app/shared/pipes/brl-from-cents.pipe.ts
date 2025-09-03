import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brlFromCents', standalone: true })
export class BrlFromCentsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    console.log('🚀 ~ BrlFromCentsPipe ~ transform ~ value:', value);
    if (value === null || value === undefined) return 'R$ 0,00';
    const reais = value / 100;
    console.log('🚀 ~ BrlFromCentsPipe ~ transform ~ reais:', reais);
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(reais);
    } catch {
      return `R$ ${reais.toFixed(2).replace('.', ',')}`;
    }
  }
}
