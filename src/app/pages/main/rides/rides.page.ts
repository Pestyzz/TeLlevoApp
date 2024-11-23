import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonText, IonItemDivider } from '@ionic/angular/standalone';
import { TripService } from 'src/app/services/trip.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { carSportOutline, personOutline, locationOutline, golfOutline, chevronForwardOutline, 
  bodyOutline, notifications, car, 
  hourglass} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-rides',
  templateUrl: './rides.page.html',
  styleUrls: ['./rides.page.scss'],
  standalone: true,
  imports: [IonItemDivider, IonText, IonTitle, IonContent, IonIcon, IonButton, IonLabel, IonItem, IonList, CommonModule, FormsModule]
})
export class RidesPage implements OnInit, OnDestroy {
  availableTrips: any[] = [];
  currentTrip: any = null;
  private tripsSubscription: Subscription | null = null;
  private currentTripSubscription: Subscription | null = null;

  constructor(private tripService: TripService, private router: Router, private authService: AuthService) {
    addIcons({car,carSportOutline,golfOutline,locationOutline,personOutline,bodyOutline,
      chevronForwardOutline,notifications,hourglass});
   }

  ngOnInit() {
    this.loadCurrentTrip();
    this.tripsSubscription = this.tripService.trips$.subscribe(trips => {
      this.availableTrips = trips;
    });
  }

  ngOnDestroy() {
    if (this.tripsSubscription) {
      this.tripsSubscription.unsubscribe();
    }
    if (this.currentTripSubscription) {
      this.currentTripSubscription.unsubscribe();
    }
  }

  loadCurrentTrip() {
    const passengerUid = this.authService.currentUserSig()?.uid;
    if (passengerUid) {
      this.tripService.subscribeToCurrentTrip(passengerUid);
      this.currentTripSubscription = this.tripService.currentTrip$.subscribe(trip => {
        this.currentTrip = trip;
      });
    } else {
      console.error('Passenger UID is undefined');
    }
  }

  getMainLocality(destinationName: string): string {
    const parts = destinationName.split(',');
    if (parts.length > 1) {
      return parts.slice(1).join(',').trim();
    }
    return destinationName;
  }

  viewTrip(trip: any) {
    this.router.navigate(['/main/map'], { state: { trip } });
  }
}
