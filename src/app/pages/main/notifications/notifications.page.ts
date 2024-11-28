import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database, ref, set } from '@angular/fire/database';
import { AlertController } from '@ionic/angular';
import { TripService } from 'src/app/services/trip.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonText, IonRefresherContent, IonRefresher } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { notifications, carOutline, personOutline } from 'ionicons/icons';
import { RefreshService } from 'src/app/services/refresh.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonRefresher, IonRefresherContent, IonText, IonIcon, IonContent, IonTitle, IonToolbar, IonHeader, IonLabel, IonItem, IonList, CommonModule]
})
export class NotificationsPage implements OnInit {
  notifications: any[] = [];

  constructor(
    private database: Database, 
    private alertController: AlertController, 
    private tripService: TripService, 
    private authService: AuthService, 
    private notificationService: NotificationService,
    private refreshService: RefreshService
  ) {
    addIcons({notifications,personOutline,carOutline});
  }

  ngOnInit() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.notificationService.listenForNotifications(currentUser.uid, (notifications) => {
        this.notifications = notifications;
      });
    }
  }

  async handleNotification(notification: any) {
    if (!notification.passenger || !notification.passenger.uid) {
      console.error('Passenger UID is missing');
      return;
    }
  
    const currentUser = this.authService.currentUserSig();
    if (!currentUser || !currentUser.uid) {
      console.error('Current user is not signed in or UID is missing');
      return;
    }
  
    const driverName = `${currentUser.firstName} ${currentUser.lastName}`;
  
    notification.handled = true;
  
    const alert = await this.alertController.create({
      header: 'Solicitud de pasajero',
      message: notification.message,
      buttons: [
        {
          text: 'Rechazar',
          role: 'cancel',
          handler: async () => {
            try {
              await this.tripService.rejectPassenger(currentUser.uid, notification.passenger.uid, driverName);
              await this.updateNotificationHandledStatus(currentUser.uid, notification);
              console.log('Join request rejected');
            } catch (error) {
              console.error('Error rejecting join request:', error);
              notification.handled = false;
            }
          }
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              await this.tripService.addPassengerToTrip(currentUser.uid, notification.passenger, driverName);
              await this.updateNotificationHandledStatus(currentUser.uid, notification);
              console.log('Join request accepted');
            } catch (error) {
              console.error('Error adding passenger to trip:', error);
              notification.handled = false;
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  async updateNotificationHandledStatus(driverUid: string, notification: any) {
    const notificationRef = ref(this.database, `notifications/${driverUid}/${notification.key}`);
    await set(notificationRef, notification);
  }

  doRefresh(event: any) {
    this.refreshService.doRefresh(event);
  }
}