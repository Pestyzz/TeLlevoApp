import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripRequested = false;

  setTripRequested(requested: boolean) {
    this.tripRequested = requested;
  }

  isTripRequested(): boolean {
    return this.tripRequested;
  }
}