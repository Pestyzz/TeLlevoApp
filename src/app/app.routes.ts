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
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'loginscreen',
    loadComponent: () => import('./loginscreen/loginscreen.page').then( m => m.LoginscreenPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'passwordreset',
    loadComponent: () => import('./passwordreset/passwordreset.page').then( m => m.PasswordresetPage)
  },

];
