import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { SettingsHelper } from '../classes/settings-helper';
import * as DateFormatter from 'php-date-formatter';

@Pipe({
  name: 'dateTimeFormat',
  pure: true // Set pure to false to enable change detection
})
export class DateTimePipe implements PipeTransform {
  localizationFormat: any;

  constructor(private setting: SettingsHelper, private cdRef: ChangeDetectorRef) {
    this.setting.settings.subscribe(response => {
      this.localizationFormat =  response?.localization;
    });
    /* this.localizationFormat = this.setting.getSettingLocalization();
    console.log('this.localizationFormat =>', this.localizationFormat); */
  }

   transform(value: any, type = 'date', mode = 'formatDate') {
    try {
      if (!value || value == '0000-00-00' || value == '0000-00-00 00:00:00') {
        return '';
      }
      const fmt = new DateFormatter();
      if (mode === 'formatDate') {
        const dateFormat = this.localizationFormat ? this.localizationFormat.dateformat.split('|')[0] : 'Y-m-d';
        const timeFormat = this.localizationFormat ? (this.localizationFormat.time_format === '24' ? 'H:i' : 'g:i A') : 'H:i';
        let vformat = '';
        switch (type) {
          case 'date': vformat = dateFormat; break;
          case 'time': vformat = timeFormat; break;
          case 'datetime': vformat = `${dateFormat} ${timeFormat}`; break;
        }
        const dateObject = new Date(value);

        // Check if the dateObject is valid
        if (isNaN(dateObject.getTime())) {
          return fmt.formatDate(new Date(), vformat); // Return the default date if the input is invalid
        }
        return fmt.formatDate(new Date(value), vformat);
      } else if (mode === 'parseDate') {
        const dateFormat = this.localizationFormat ? this.localizationFormat.dateformat.split('|')[0] : 'Y-m-d';
        const timeFormat = this.localizationFormat ? (this.localizationFormat.time_format === '24' ? 'H:i' : 'g:i A') : 'H:i';
  
        let vformat = '';
        let new_format = '';
        switch (type) {
          case 'date': 
            vformat = dateFormat; new_format = 'Y-m-d'; 
          break;

          case 'time': 
            vformat = timeFormat; new_format = 'H:i';
          break;

          case 'datetime': 
            const date = fmt.parseDate(value, `${dateFormat} ${timeFormat}`);
            return fmt.formatDate(date, 'Y-m-d') + 'T' + fmt.formatDate(date, 'H:i');
          break;
        }
  
        return fmt.formatDate(fmt.parseDate(value, vformat), new_format);
      }
  
      return '';
    } catch (error) {
      console.log('pipe error =>', error);
      return ;
    }
    
  }
}
