import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CopyProjectPage } from './copy-project.page';

const routes: Routes = [
  {
    path: '',
    component: CopyProjectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CopyProjectPageRoutingModule {}
