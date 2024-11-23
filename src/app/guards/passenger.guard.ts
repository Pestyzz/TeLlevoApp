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
    return new Promise<boolean>(resolve => {
      tripService.subscribeToCurrentTrip(currentUser.uid);
      tripService.currentTrip$.subscribe(async trip => {
        if (trip && !trip.completed) {
          const alert = await alertController.create({
            header: 'Viaje en curso',
            message: 'No puedes solicitar unirse a otro viaje mientras tienes un viaje en curso',
            buttons: ['OK']
          });

          await alert.present();
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } else {
    return true;
  }
};
