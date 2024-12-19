import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttachFilePage } from './attach-file.page';

const routes: Routes = [
  {
    path: '',
    component: AttachFilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttachFilePageRoutingModule {}
