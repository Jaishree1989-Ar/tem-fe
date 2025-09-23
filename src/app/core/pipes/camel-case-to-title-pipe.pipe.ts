import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCaseToTitlePipe',
  standalone: true
})

/**
 * CamelCaseToTitlePipePipe
 *
 * Angular pipe that transforms a camelCase string into a title case string
 * by inserting spaces before capital letters and capitalizing the first letter.
 *
 * Example:
 *   Input:  "userName"
 *   Output: "User Name"
 *
 * Usage in template:
 *   {{ 'camelCaseString' | camelCaseToTitlePipe }}
 */
export class CamelCaseToTitlePipePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    // Insert space before capital letters and capitalize first letter
    const result = value.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

}
