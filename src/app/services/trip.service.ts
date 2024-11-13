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

  completeTrip(driverUid: string) {
    const tripRef = ref(this.database, `trip/${driverUid}`);
    update(tripRef, { completed: true }).then(() => {
      localStorage.removeItem('tripInfo'); // Limpiar los datos del viaje de localStorage
    });
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
    driverUid = driverUid.trim();
    const notificationKey = await this.notificationService.addNotification(driverUid, passenger, 'joinRequest');
    const requestRef = ref(this.database, `trip/${driverUid}/requests/${passenger.uid}`);
    const request = {
      ...passenger,
      notificationKey: notificationKey
    }
    await set(requestRef, request);
  }

  listenForJoinRequests(driverUid: string, callback: (request: any) => void) {
    try {
      if (this.joinRequestsRef) {
        off(this.joinRequestsRef);
      }
      this.joinRequestsRef = ref(this.database, `trip/${driverUid}/requests`);
      console.log('Listening for join requests at:', this.joinRequestsRef.toString());
  
      onValue(this.joinRequestsRef, (snapshot) => {
        if (snapshot.exists()) {
          const requests = snapshot.val();
          console.log('Requests:', requests);
          Object.keys(requests).forEach(key => {
            const request = requests[key];
            console.log('Processing request:', request);
            callback(request);
          });
        } else {
          console.log('No join requests found for driver:', driverUid);
        }
      });
    } catch (error) {
      console.error('Error in listenForJoinRequests:', error);
    }
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
    try {
      console.log('Adding passenger to trip for driver:', driverUid);
      const tripRef = ref(this.database, `trip/${driverUid}`);
      const snapshot = await get(tripRef);
  
      if (snapshot.exists()) {
        const trip = snapshot.val();
        console.log('Trip data:', trip);
  
        if (!trip.passengers) {
          trip.passengers = [];
        }
  
        if (trip.passengers.length >= trip.vehicle.capacity) {
          throw new Error('Vehicle is full');
        }
  
        trip.passengers.push(passenger);
        await update(tripRef, { passengers: trip.passengers });
        console.log('Passenger added:', passenger);
  
        await this.notificationService.notifyPassenger(passenger.uid, `${driverName} ha aceptado tu solicitud de unirte a su viaje!`);
        localStorage.setItem('tripInfo', JSON.stringify(trip));
      } else {
        console.error('Trip not found for driver:', driverUid);
      }
    } catch (error) {
      console.error('Error in addPassengerToTrip:', error);
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