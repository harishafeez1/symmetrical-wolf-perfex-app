import { Pipe, PipeTransform } from '@angular/core';
import { SettingsHelper } from '../classes/settings-helper';

@Pipe({
  name: 'appFormatMoney',
  pure: false // Set pure to false to enable change detection
})
export class CurrencyPipe implements PipeTransform {

  currencySymbol: string;
  finance: any;
  
  settings = {
		currency: {
			symbol : "$",		// default currency symbol is '$'
			format : "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
			decimal_separator : ".",		// decimal point separator
			thousand_separator : ",",		// thousands separator
			precision : 2,		// decimal places
			grouping : 3		// digit grouping (not implemented yet)
		},
		number: {
			precision : 0,		// default precision on numbers is 0
			grouping : 3,		// digit grouping (not implemented yet)
			thousand_separator : ",",
			decimal_separator : "."
		}
	};

  constructor(private setting: SettingsHelper) {
   
    this.setting.settings.subscribe({
      next: response => {
        this.finance = response?.sales;
      }
    });
  }

  transform(amount, currency, excludeSymbol = false) {
    /**
     *  Check ewhether the amount is numeric and valid
     */
    if (isNaN(amount) || amount == null) {
      amount = 0;
    }

    if(typeof currency == 'undefined' || !currency || currency?.symbol == null) {
      currency = this.settings.currency;
    }
    /**
     * Determine the symbol
     * @var string
     */
    let symbol = !excludeSymbol ? currency?.symbol : '';

    /**
     * Check decimal places
     * @var mixed
     */
    let d = this.finance?.remove_decimals_on_zero == 1 && !this.isDecimal(amount) ? 0 : 2;

    /**
     * Format the amount
     * @var string
     */
    let amountFormatted = this.number_format(amount, d, currency?.decimal_separator, currency?.thousand_separator);

    /**
     * Maybe add the currency symbol
     * @var string
     */
     const amt = amountFormatted.includes('-');
    return (currency?.placement === 'after' ? (amt ? '-' + amountFormatted.split('-')[1] + '' + symbol : amountFormatted + '' + symbol) : (amt ? '-' + symbol + '' + amountFormatted.split('-')[1] : symbol + '' + amountFormatted));
  }

  private isDecimal(number) {
    return !isNaN(number) && number % 1 !== 0;
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
