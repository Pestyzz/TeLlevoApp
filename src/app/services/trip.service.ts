import { Injectable } from '@angular/core';
import { Database, get, off, onValue, ref, set, update } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripStarted = false;
  private tripsSubject = new BehaviorSubject<any[]>([]);
  trips$ = this.tripsSubject.asObservable();
  
  private joinRequestsRef: any;

  constructor(private database: Database, private notificationService: NotificationService) { 
    this.listenForTrips();
  }

  startTrip() {
    this.tripStarted = true;
  }

  completeTrip() {
    this.tripStarted = false;
  }

  isTripStarted() {
    return this.tripStarted;
  }

  private listenForTrips() {
    const tripsRef = ref(this.database, 'trip');
    onValue(tripsRef, (snapshot) => {
      if (snapshot.exists()) {
        const trips = snapshot.val();
        const tripsArray = Object.keys(trips).map(key => trips[key]);
        this.tripsSubject.next(tripsArray);
      } else {
        this.tripsSubject.next([]);
      }
    });
  }

  async requestToJoinTrip(driverUid: string, passenger: any) {
    const notificationKey = await this.notificationService.addNotification(driverUid, passenger, 'joinRequest');
    const requestRef = ref(this.database, `trip/${driverUid}/requests/${passenger.uid}`);
    const request = {
      ...passenger,
      notificationKey: notificationKey
    }
    await set(requestRef, request);
  }

  listenForJoinRequests(driverUid: string, callback: (request: any) => void) {
    if (this.joinRequestsRef) {
      off(this.joinRequestsRef);
    }
    this.joinRequestsRef = ref(this.database, `trip/${driverUid}/requests`);
    onValue(this.joinRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const requests = snapshot.val();
        console.log('Requests:', requests);
        Object.keys(requests).forEach(key => {
          const request = requests[key];
          callback(request);
        });
      }
    });
  }

  stopListeningForJoinRequests() {
    if (this.joinRequestsRef) {
      off(this.joinRequestsRef);
      this.joinRequestsRef = null;
    }
  }

  async rejectPassenger(driverUid: string, passengerUid: string, driverName: string) {
    const requestRef = ref(this.database, `trip/${driverUid}/requests/${passengerUid}`);
    await set(requestRef, null);
    await this.notificationService.notifyPassenger(passengerUid, `${driverName} ha rechazado tu solicitud de unirte a su viaje.`);
  }

  listenForPassengerNotifications(passengerUid: string, callback: (notifications: any[]) => void) {
    const notificationsRef = ref(this.database, `notifications/${passengerUid}`);
    onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notifications = Object.values(snapshot.val());
        callback(notifications);
      } else {
        callback([]);
      }
    });
  }

  async addPassengerToTrip(driverUid: string, passenger: any, driverName: string) {
    const tripRef = ref(this.database, `trip/${driverUid}`);
    const snapshot = await get(tripRef);
    if (snapshot.exists()) {
      const trip = snapshot.val();
      if (!trip.passengers) {
        trip.passengers = [];
      }
      if (trip.passengers.length >= trip.vehicle.capacity) {
        throw new Error('Vehicle is full');
      }
      trip.passengers.push(passenger);
      await update(tripRef, { passengers: trip.passengers });
      await this.notificationService.notifyPassenger(passenger.uid, `${driverName} ha aceptado tu solicitud de unirte a su viaje!`);
    }
  }

  async getCurrentTrip(passengerUid: string): Promise<any> {
    const tripRef = ref(this.database, `trip`);
    const snapshot = await get(tripRef);
    if (snapshot.exists()) {
      const trips = snapshot.val();
      for (const tripId in trips) {
        const trip = trips[tripId];
        if (trip.passengers && trip.passengers.some((p: any) => p.uid === passengerUid) && !trip.completed) {
          return trip;
        }
      }
    }
    return null;
  }
}