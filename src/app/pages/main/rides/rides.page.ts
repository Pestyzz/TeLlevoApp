import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, 
  IonText } from '@ionic/angular/standalone';
import { TripService } from 'src/app/services/trip.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { carSportOutline, personOutline, locationOutline, golfOutline, chevronForwardOutline, 
  bodyOutline, notifications, car } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rides',
  templateUrl: './rides.page.html',
  styleUrls: ['./rides.page.scss'],
  standalone: true,
  imports: [IonText, IonHeader, IonTitle, IonToolbar, IonContent, IonIcon, IonButton, IonLabel, IonItem, IonList, CommonModule, FormsModule]
})
export class RidesPage implements OnInit, OnDestroy {
  availableTrips: any[] = [];
  private tripsSubscription: Subscription | null = null;

  constructor(private tripService: TripService, private router: Router) {
    addIcons({car,carSportOutline,golfOutline,locationOutline,personOutline,bodyOutline,
      chevronForwardOutline,notifications});
   }

  ngOnInit() {
    this.tripsSubscription = this.tripService.trips$.subscribe(trips => {
      this.availableTrips = trips;
    });
  }

  ngOnDestroy() {
    if (this.tripsSubscription) {
      this.tripsSubscription.unsubscribe();
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
