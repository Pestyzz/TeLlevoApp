import { Injectable } from '@angular/core';
import { child, Database, get, off, onValue, ref, set, update } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripStarted = false;
  private tripsSubject = new BehaviorSubject<any[]>([]);
  trips$ = this.tripsSubject.asObservable();
  
  private joinRequestsRef: any;

  constructor(private database: Database) { 
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
    const requestRef = ref(this.database, `trip/${driverUid}/requests`);
    await set(requestRef, passenger);
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
        callback(requests);
      }
    });
  }

  stopListeningForJoinRequests() {
    if (this.joinRequestsRef) {
      off(this.joinRequestsRef);
      this.joinRequestsRef = null;
    }
  }

  async addPassengerToTrip(driverUid: string, passenger: any) {
    const tripRef = ref(this.database, `trip/${driverUid}`);
    const snapshot = await get(tripRef);
    if (snapshot.exists()) {
      const trip = snapshot.val();
      if (!trip.passengers) {
        trip.passengers = [];
      }
      if (trip.passengers.length + 1 >= trip.vehicle.capacity) {
        throw new Error('Vehicle is full');
      }
      trip.passengers.push(passenger);
      await update(tripRef, { passengers: trip.passengers });
    }
  }
}
