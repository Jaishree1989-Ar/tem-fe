import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetter',
  standalone: true
})

/**
 * FirstLetterPipe
 *
 * Angular pipe that extracts and returns the first letter of a given string,
 * after trimming whitespace and converting it to uppercase.
 *
 * Example:
 *   Input:  "john doe"
 *   Output: "J"
 *
 * Usage in template:
 *   {{ 'hello world' | firstLetter }}
 */
export class FirstLetterPipe implements PipeTransform {

  transform(value: string | undefined): string {
    if (!value) return '';
    return value.trim().charAt(0).toUpperCase();
  }

}
