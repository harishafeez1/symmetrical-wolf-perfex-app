import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateDiscussionPage } from './create-discussion.page';

const routes: Routes = [
  {
    path: '',
    component: CreateDiscussionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateDiscussionPageRoutingModule {}
