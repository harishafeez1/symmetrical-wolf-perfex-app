import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConvertToInvoicePageRoutingModule } from './convert-to-invoice-routing.module';

import { ConvertToInvoicePage } from './convert-to-invoice.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConvertToInvoicePageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ConvertToInvoicePage]
})
export class ConvertToInvoicePageModule {}
