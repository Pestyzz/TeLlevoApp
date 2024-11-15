import { Injectable } from '@angular/core';
import { Database, ref, set, push, onValue, get, update } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private database: Database) { }

  async addNotification(driverUid: string, passenger: any, type: string) {
    const notificationRef = ref(this.database, `notifications/${driverUid}`);
    const newNotificationRef = push(notificationRef);
    const notification = {
      key: newNotificationRef.key,
      message: `${passenger.firstName} ${passenger.lastName} quiere unirse a tu viaje!`,
      passenger: passenger,
      type: type,
      handled: false
    };
    await set(newNotificationRef, notification);
    return newNotificationRef.key;
  }

  listenForNotifications(userUid: string, callback: (notifications: any[]) => void) {
    const notificationsRef = ref(this.database, `notifications/${userUid}`);
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications = Object.values(snapshot.val());
        callback(notifications);
      } else {
        callback([]);
      }
    });
  }

  listenForNewNotifications(userUid: string, callback: (newNotificationsCount: number) => void) {
    const notificationsRef = ref(this.database, `notifications/${userUid}`);
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications = Object.values(snapshot.val());
        const newNotifications = notifications.filter((notification: any) => !notification.handled);
        callback(newNotifications.length);
      } else {
        callback(0);
      }
    });
  }

  async markNotificationAsHandled(userUid: string) {
    const notificationsRef = ref(this.database, `notifications/${userUid}`);
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const updates: any = {};
      snapshot.forEach((childSnapshot) => {
        const notification = childSnapshot.val();
        if (!notification.handled) {
          updates[childSnapshot.key] = { ...notification, handled: true };
        }
      });
      await update(notificationsRef, updates);
    }
  }

  async notifyPassenger(passengerUid: string, message: string) {
    const notificationRef = ref(this.database, `notifications/${passengerUid}`);
    const newNotificationRef = push(notificationRef);
    const notification = {
      key: newNotificationRef.key,
      message: message,
      type: 'response',
    };

    await set(newNotificationRef, notification);
  }
}