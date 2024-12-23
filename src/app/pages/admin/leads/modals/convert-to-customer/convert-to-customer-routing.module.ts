import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConvertToCustomerPage } from './convert-to-customer.page';

const routes: Routes = [
  {
    path: '',
    component: ConvertToCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConvertToCustomerPageRoutingModule {}
