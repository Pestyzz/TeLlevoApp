import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/map-screen/map-screen.page').then(m => m.MapScreenPage)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then( m => m.NotificationsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'close-vehicles',
    loadComponent: () => import('./pages/close-vehicles/close-vehicles.page').then( m => m.CloseVehiclesPage)
  },
  {
    path: 'test',
    loadComponent: () => import('./pages/test-map/test-map.page').then( m => m.TestMapPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then( m => m.HistoryPage)
  }
];
