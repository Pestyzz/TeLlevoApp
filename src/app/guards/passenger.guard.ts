import { AlertController } from '@ionic/angular';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';
import { inject } from '@angular/core';

export const passengerGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)
  const alertController = inject(AlertController)
  const tripService = inject(TripService)

  const activeProfile = authService.getActiveProfile();
  const currentUser = authService.currentUserSig();

  if (activeProfile === 'passenger' && currentUser) {
    const trip = await tripService.getCurrentTrip(currentUser.uid);
    console.log('Trip:', trip);
    if (trip && trip.status !== 'completed') {
      const alert = await alertController.create({
        header: 'Viaje en curso',
        message: 'No puedes solicitar unirse a otro viaje mientras tienes un viaje en curso',
        buttons: ['OK']
      });

      await alert.present();
      router.navigate(['/main/map']);
      return false;
    }
  }

  return true;
};
