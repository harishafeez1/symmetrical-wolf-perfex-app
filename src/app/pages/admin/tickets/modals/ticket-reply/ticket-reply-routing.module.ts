import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TicketReplyPage } from './ticket-reply.page';

const routes: Routes = [
  {
    path: '',
    component: TicketReplyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketReplyPageRoutingModule {}
