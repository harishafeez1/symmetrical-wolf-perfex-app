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
    path: 'create-milestone',
    loadChildren: () => import('./modals/create-milestone/create-milestone.module').then( m => m.CreateMilestonePageModule)
  },
  {
    path: 'create-discussion',
    loadChildren: () => import('./modals/create-discussion/create-discussion.module').then( m => m.CreateDiscussionPageModule)
  },  {
    path: 'copy-project',
    loadChildren: () => import('./modals/copy-project/copy-project.module').then( m => m.CopyProjectPageModule)
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
export class ProjectsRoutingModule { }