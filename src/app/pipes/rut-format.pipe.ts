import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rutFormat',
  standalone: true
})
export class RutFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    const rut = value.replace(/[^0-9kK]/g, '');

    if (rut.length < 8) return value;

    return rut.replace(/^(\d{1,2})(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
  }
}