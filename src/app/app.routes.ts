import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
 
  {
    path: 'registerform',
    loadComponent: () => import('./registerform/registerform.page').then( m => m.RegisterformPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'loginscreen',
    loadComponent: () => import('./loginscreen/loginscreen.page').then( m => m.LoginscreenPage)
  },

];
