import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DarkModePage } from './dark-mode.page';

const routes: Routes = [
  {
    path: '',
    component: DarkModePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DarkModePageRoutingModule {}
