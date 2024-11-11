import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database, onValue, ref } from '@angular/fire/database';
import { AlertController } from '@ionic/angular';
import { TripService } from 'src/app/services/trip.service';
import { AuthService } from '../../services/auth.service';
import { IonHeader, IonToolbar, IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonTitle, IonToolbar, IonHeader, CommonModule]
})
export class NotificationsPage implements OnInit {
  notifications: any[] = [];

  constructor(private database: Database, private alertController: AlertController, private tripService: TripService,
    private authService: AuthService) {

  }

  ngOnInit() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      const notificationsRef = ref(this.database, `notifications/${currentUser.uid}`);
      onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          this.notifications = Object.values(snapshot.val());
        }
      });
    }
  }

  async handleNotification(notification: any) {
    const alert = await this.alertController.create({
      header: 'Solicitud de pasajero',
      message: notification.message,
      buttons: [
        {
          text: 'Rechazar',
          role: 'cancel',
          handler: async () => {
            try {
              const currentUser = this.authService.currentUserSig();
              if (currentUser) {
                await this.tripService.rejectPassenger(currentUser.uid, notification.passenger.uid);
                console.log('Join request rejected')
              }
            } catch (error) {
              console.error('Error rejecting join request:', error);
            }
          }
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              const currentUser = this.authService.currentUserSig();
              if (currentUser) {
                await this.tripService.addPassengerToTrip(currentUser.uid, notification.passenger);
                console.log('Join request accepted')
              }
            } catch (error) {
              console.error('Error adding passenger to trip:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}