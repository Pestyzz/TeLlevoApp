import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';
import { TripService } from '../services/trip.service';

export const driverGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)
  const alertController = inject(AlertController)
  const tripService = inject(TripService)

  const activeProfile = authService.getActiveProfile();

  if (activeProfile === 'driver' && tripService.isTripStarted()) {
    const alert = await alertController.create({
      header: 'Advertencia',
      message: 'Estás en un viaje y no tienes acceso a este apartado',
      buttons: ['OK']
    });
    await alert.present();
    router.navigate(['/main']);
    return false;
  }
  return true;
};