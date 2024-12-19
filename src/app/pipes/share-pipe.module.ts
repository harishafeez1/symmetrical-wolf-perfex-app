import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTimePipe } from './date-time.pipe';
import { CurrencyPipe } from './currency.pipe';
import { NumberFormatPipe } from './number.pipe';



@NgModule({
  declarations: [DateTimePipe, CurrencyPipe, NumberFormatPipe],
  imports: [
    CommonModule
  ],
  exports: [DateTimePipe, CurrencyPipe, NumberFormatPipe]
})
export class SharePipeModule { }
