import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateReminderPage } from './create-reminder.page';

const routes: Routes = [
  {
    path: '',
    component: CreateReminderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateReminderPageRoutingModule {}
