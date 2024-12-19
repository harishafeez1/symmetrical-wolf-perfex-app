import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeFirstLetter'
})
export class CapitalizeFirstLetterPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    
    // Split the input value into an array of words
    const words = value.split(' ');

    // Capitalize the first character of each word
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });

    // Join the words back into a sentence
    return capitalizedWords.join(' ');
  }

}
