import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/auth-screen',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage),
    canActivate: [authGuard] ,
    children: [
      {
        path: 'auth-screen',
        loadComponent: () => import('./pages/auth/auth-screen/auth-screen.page').then(m => m.AuthScreenPage)
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/auth/signup/signup.page').then(m => m.SignupPage)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
      }
    ]
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.page').then(m => m.MainPage),
    // children: [
    //   {

    //   },
    // ]
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map-screen/map-screen.page').then(m => m.MapScreenPage)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'close-vehicles',
    loadComponent: () => import('./pages/close-vehicles/close-vehicles.page').then(m => m.CloseVehiclesPage)
  },
  {
    path: 'test',
    loadComponent: () => import('./pages/test-map/test-map.page').then(m => m.TestMapPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage)
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage)
  }

];