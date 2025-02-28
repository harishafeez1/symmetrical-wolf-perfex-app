import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppSubscriptionPage } from './app-subscription.page';

const routes: Routes = [
  {
    path: '',
    component: AppSubscriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppSubscriptionPageRoutingModule {}
