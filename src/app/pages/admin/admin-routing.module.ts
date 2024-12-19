import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
    },
    {
        path: 'customers',
        loadChildren: () => import('./customers/customers-routing.module').then(m => m.CustomersRoutingModule)
    },
    {
        path: 'invoices',
        loadChildren: () => import('./invoices/invoices-routing.module').then(m => m.InvoicesRoutingModule)
    },
    {
        path: 'proposals',
        loadChildren: () => import('./proposals/proposals-routing.module').then(m => m.ProposalsRoutingModule)
    },
    {
        path: 'estimates',
        loadChildren: () => import('./estimates/estimates-routing.module').then(m => m.EstimatesRoutingModule)
    },
    {
        path: 'expenses',
        loadChildren: () => import('./expenses/expenses-routing.module').then(m => m.ExpensesRoutingModule)
    },
    {
        path: 'projects',
        loadChildren: () => import('./projects/projects-routing.module').then(m => m.ProjectsRoutingModule)
    },
    {
        path: 'tasks',
        loadChildren: () => import('./tasks/tasks-routing.module').then(m => m.TasksRoutingModule)
    },
    {
        path: 'leads',
        loadChildren: () => import('./leads/leads-routing.module').then(m => m.LeadsRoutingModule)
    },
    {
        path: 'payments',
        loadChildren: () => import('./payments/payments-routing.module').then(m => m.PaymentsRoutingModule)
    },
    {
        path: 'credit_notes',
        loadChildren: () => import('./credit_notes/credit_notes-routing.module').then(m => m.CreditNotesRoutingModule)
    },
    {
        path: 'invoice_items',
        loadChildren: () => import('./invoice_items/invoice_items-routing.module').then(m => m.InvoiceItemsRoutingModule)
    },
    {
        path: 'staffs',
        loadChildren: () => import('./staffs/staffs-routing.module').then(m => m.StaffsRoutingModule)
    },
    {
        path: 'subscriptions',
        loadChildren: () => import('./subscriptions/subscriptions-routing.module').then(m => m.SubscriptionsRoutingModule)
    },
    {
        path: 'tickets',
        loadChildren: () => import('./tickets/tickets-routing.module').then(m => m.TicketsRoutingModule)
    },
    {
        path: 'contracts',
        loadChildren: () => import('./contracts/contracts-routing.module').then(m => m.ContractsRoutingModule)
    },
    {
        path: 'notifications',
        loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsPageModule)
    },
    {
        path: 'refund',
        loadChildren: () => import('./credit_notes/modals/refund/refund.module').then( m => m.RefundPageModule)
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
export class AdminRoutingModule { }