import { Pipe, PipeTransform } from '@angular/core';
import { SettingsHelper } from '../classes/settings-helper';

@Pipe({
  name: 'appFormatNumber',
  pure: false // Set pure to false to enable change detection
})
export class NumberFormatPipe implements PipeTransform {
  settings: any;

  constructor(private setting: SettingsHelper) {
    this.setting.settings.subscribe(response => {
      this.settings = response?.sales;
    });
  }

  transform(total: number, force_check_zero_decimals = false): string {
    if (isNaN(total)) {
      return total.toString();
    }

    const decimal_separator = this.settings?.decimal_separator;
    const thousand_separator = this.settings?.thousand_separator;

    let d = 2;
    if (this.settings?.remove_decimals_on_zero === 1 || force_check_zero_decimals) {
      if (!this.is_decimal(total)) {
        d = 0;
      }
    }

    return this.number_format(total, d, decimal_separator, thousand_separator);
  }

  is_decimal(val: number): boolean {
    return this.is_numeric(val) && Math.floor(val) !== val;
  }

  is_numeric(val: any): boolean {
    return typeof val === 'number' || /^\d+(\.\d+)?$/.test(val);
  }

  private number_format(num, decimals = 0, decimal_separator = '.', thousands_separator = ',') {
    // Convert the number to a float
    num = parseFloat(num);

    // Check if the conversion was successful
    if (isNaN(num)) {
      return '';
    }

    // Convert the number to a string
    num = num.toFixed(decimals).toString();

    // Split the number into integer and decimal parts
    var parts = num.split('.');

    // Format the integer part with thousands separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_separator);

    // Join the parts and return the formatted number
    return parts.join(decimal_separator);
  }

}