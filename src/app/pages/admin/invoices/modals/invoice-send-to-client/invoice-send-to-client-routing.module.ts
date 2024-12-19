import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoiceSendToClientPage } from './invoice-send-to-client.page';

const routes: Routes = [
  {
    path: '',
    component: InvoiceSendToClientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceSendToClientPageRoutingModule {}
