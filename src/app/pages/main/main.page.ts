import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonButton, IonIcon, IonItem, IonLabel, IonSelect, 
  IonSelectOption, IonRouterOutlet, IonFooter, IonTabs, IonFab, IonFabButton, IonTabBar, IonTab } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { car, logOutOutline, map, notifications, person, refreshOutline, stopwatchOutline, time } from 'ionicons/icons';
import { TabBarComponent } from "../../components/tab-bar/tab-bar.component";
import { MapComponent } from "../../components/map/map.component";
import { filter } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonTab, IonTabBar, IonFabButton, IonFab, IonTabs, IonFooter, IonRouterOutlet, IonSelectOption, IonSelect, IonLabel, IonItem, IonIcon, IonButton, IonButtons,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule, RouterLink, TabBarComponent, MapComponent]
})
export class MainPage implements OnInit {
  activeProfile: 'passenger' | 'driver' | null = null;
  isPassenger = false;
  isDriver = false;

  showBackButton = false;
  titleAlignment = 'ion-text-start';

  constructor(private authService: AuthService, private router: Router) { 
    addIcons({logOutOutline, car, notifications, time, map, person,
      refreshOutline, stopwatchOutline});
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        setTimeout(() => {
          const currentUser = this.authService.currentUserSig();
          console.log(currentUser);
          if (currentUser) {
            this.isPassenger = currentUser.passenger;
            this.isDriver = currentUser.driver;
            this.activeProfile = this.authService.activeProfileSig();

            if (!this.activeProfile) {
              this.activeProfile = this.isPassenger ? 'passenger' : 'driver';
              this.authService.setActiveProfile(this.activeProfile);
            }
          }
          console.log(this.activeProfile);
        }, 600);
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (url !== '/main/maps' && url !== '/main/rides') {
        this.showBackButton = true;
        this.titleAlignment = 'ion-text-end';
      } else {
        this.showBackButton = true;
        this.titleAlignment = 'ion-text-start';
      }
    });
  }

  goBack() {
    if (this.activeProfile === 'driver') {
      this.router.navigate(['/main/maps']);
    } else {
      this.router.navigate(['/maps/rides']);
    }
  }

  changeProfile(profile: 'passenger' | 'driver') {
    this.activeProfile = profile;
    this.authService.setActiveProfile(profile);
  }

  showDropdown(): boolean {
    const currentUrl = this.router.url;
    return (this.activeProfile === 'driver' && currentUrl.includes('/map')) ||
           (this.activeProfile === 'passenger' && currentUrl.includes('/rides'));
  }
}
