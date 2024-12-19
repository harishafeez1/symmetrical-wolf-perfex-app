import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderAppPage } from './order-app.page';

const routes: Routes = [
  {
    path: '',
    component: OrderAppPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderAppPageRoutingModule {}
