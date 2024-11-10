import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number, currencySymbol: string = '$'): string {
    if (value !== null && value !== undefined) {
      return `${currencySymbol} ${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    }
    return '';
  }
}