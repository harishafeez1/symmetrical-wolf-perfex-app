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
        loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
    },
    {
        path: 'view/:id',
        loadChildren: () => import('./view/view.module').then(m => m.ViewPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./create/create.module').then(m => m.CreatePageModule)
    },
    {
        path: 'edit/:id',
        loadChildren: () => import('./create/create.module').then(m => m.CreatePageModule)
    },
    {
        path: 'convert-to-invoice',
        loadChildren: () => import('./modals/convert-to-invoice/convert-to-invoice.module').then(m => m.ConvertToInvoicePageModule)
    },


];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class ExpensesRoutingModule { }