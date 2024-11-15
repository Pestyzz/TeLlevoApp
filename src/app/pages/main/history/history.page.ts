import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, 
  IonIcon, IonList, IonLabel, IonText } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { TripService } from 'src/app/services/trip.service';
import { PriceFormatPipe } from 'src/app/pipes/price-format.pipe';
import { addIcons } from 'ionicons';
import { carSportOutline, golfOutline, locationOutline, personOutline, time } from 'ionicons/icons';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonText, IonLabel, IonList, IonIcon, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule]
})
export class HistoryPage implements OnInit {
  history: any[] = [];
  activeProfile: 'passenger' | 'driver' | null = null;

  constructor(private authService: AuthService, private tripService: TripService) { 
    addIcons({time,carSportOutline,golfOutline,locationOutline,personOutline});
  }

  ngOnInit() {
    this.activeProfile = this.authService.getActiveProfile();
    this.loadHistory();
  }

  async loadHistory() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      const isDriver = this.activeProfile === 'driver';
      this.history = await this.tripService.getCompletedTrips(currentUser.uid, isDriver);
    }
  }

  getMainLocality(destinationName: string): string {
    const parts = destinationName.split(',');
    if (parts.length > 1) {
      return parts.slice(1).join(',').trim();
    }
    return destinationName;
  }
}
