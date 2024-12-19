import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplyToInvoicePageRoutingModule } from './apply-to-invoice-routing.module';

import { ApplyToInvoicePage } from './apply-to-invoice.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ApplyToInvoicePageRoutingModule,
    TranslateModule
  ],
  declarations: [ApplyToInvoicePage]
})
export class ApplyToInvoicePageModule {}
