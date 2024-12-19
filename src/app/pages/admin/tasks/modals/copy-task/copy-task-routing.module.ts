import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CopyTaskPage } from './copy-task.page';

const routes: Routes = [
  {
    path: '',
    component: CopyTaskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CopyTaskPageRoutingModule {}
