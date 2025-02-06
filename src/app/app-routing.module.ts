import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';
import { BaseUrlGuard } from './guards/base-url.guard';
import { IntroGuard } from './guards/intro.guard';
import { SubscriptionGuard } from './guards/subscription.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    canLoad: [BaseUrlGuard, AutoLoginGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin-routing.module').then(m => m.AdminRoutingModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'base-url',
    loadChildren: () => import('./pages/base-url/base-url.module').then(m => m.BaseUrlPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings-routing.module').then(m => m.SettingsRoutingModule)
  },
  {
    path: 'app-subscription',
    loadChildren: () => import('./pages/app-subscription/app-subscription.module').then(m => m.AppSubscriptionPageModule)
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then( m => m.IntroPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
