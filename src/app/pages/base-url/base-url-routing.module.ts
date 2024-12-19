import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BaseUrlPage } from './base-url.page';

const routes: Routes = [
  {
    path: '',
    component: BaseUrlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaseUrlPageRoutingModule {}
