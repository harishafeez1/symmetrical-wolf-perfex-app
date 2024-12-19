import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateTimesheetPage } from './create-timesheet.page';

const routes: Routes = [
  {
    path: '',
    component: CreateTimesheetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateTimesheetPageRoutingModule {}
