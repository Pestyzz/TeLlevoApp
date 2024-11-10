import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { tripGuard } from './guards/trip.guard';

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
    children: [
      {
        path: 'notifications',
        loadComponent: () => import('./pages/main/notifications/notifications.page').then(m => m.NotificationsPage),
        canActivate: [tripGuard]
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/main/history/history.page').then(m => m.HistoryPage),
        canActivate: [tripGuard]
      },
      {
        path: 'map',
        loadComponent: () => import('./pages/main/map-screen/map-screen.page').then(m => m.MapScreenPage),
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/main/messages/messages.page').then( m => m.MessagesPage),
        canActivate: [tripGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/main/profile/profile.page').then(m => m.ProfilePage),
        canActivate: [tripGuard]
      }
    ]
  }
  // {
  //   path: 'close-vehicles',
  //   loadComponent: () => import('./pages/close-vehicles/close-vehicles.page').then(m => m.CloseVehiclesPage)
  // },

];