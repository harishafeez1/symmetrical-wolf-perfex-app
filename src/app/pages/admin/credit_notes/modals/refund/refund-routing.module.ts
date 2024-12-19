import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundPage } from './refund.page';

const routes: Routes = [
  {
    path: '',
    component: RefundPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundPageRoutingModule {}
