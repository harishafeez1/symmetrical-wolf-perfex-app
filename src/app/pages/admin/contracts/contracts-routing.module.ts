import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

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
    path: 'create',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./create/create.module').then( m => m.CreatePageModule)
  },
  {
    path: 'view/:id',
    loadChildren: () => import('./view/view.module').then( m => m.ViewPageModule)
  },
  {
    path: 'filters',
    loadChildren: () => import('./modals/filters/filters.module').then( m => m.FiltersPageModule)
  },
  {
    path: 'create-comment',
    loadChildren: () => import('./modals/create-comment/create-comment.module').then( m => m.CreateCommentPageModule)
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
export class ContractsRoutingModule { }
