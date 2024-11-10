import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripStarted = false;

  startTrip() {
    this.tripStarted = true;
  }

  completeTrip() {
    this.tripStarted = false;
  }

  isTripStarted() {
    return this.tripStarted;
  }
}
