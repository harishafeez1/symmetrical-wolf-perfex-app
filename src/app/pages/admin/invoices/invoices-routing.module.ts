import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        loadChildren: () => import('./list/list.module').then( m => m.ListPageModule)
    },
    {
        path: 'view/:id',
        loadChildren: () => import('./view/view.module').then( m => m.ViewPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
    },
    {
        path: 'edit/:id',
        loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
    },
    {
        path: 'filters',
        loadChildren: () => import('./modals/filters/filters.module').then( m => m.FiltersPageModule)
    },
  {
    path: 'create-payment',
    loadChildren: () => import('./modals/create-payment/create-payment.module').then( m => m.CreatePaymentPageModule)
  },
  {
    path: 'create-note',
    loadChildren: () => import('./modals/create-note/create-note.module').then( m => m.CreateNotePageModule)
  },
  {
    path: 'create-reminder',
    loadChildren: () => import('./modals/create-reminder/create-reminder.module').then( m => m.CreateReminderPageModule)
  },
  {
    path: 'invoice-send-to-client',
    loadChildren: () => import('./modals/invoice-send-to-client/invoice-send-to-client.module').then( m => m.InvoiceSendToClientPageModule)
  }
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class InvoicesRoutingModule { }