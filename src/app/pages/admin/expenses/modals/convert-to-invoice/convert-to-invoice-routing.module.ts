import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConvertToInvoicePage } from './convert-to-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: ConvertToInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvertToInvoicePageRoutingModule {}
