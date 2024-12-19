import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateMilestonePage } from './create-milestone.page';

const routes: Routes = [
  {
    path: '',
    component: CreateMilestonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateMilestonePageRoutingModule {}
