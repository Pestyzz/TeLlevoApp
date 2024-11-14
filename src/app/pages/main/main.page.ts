import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonItem, IonSelect, IonSelectOption, 
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {car, logOutOutline, map, notifications, person, refreshOutline,
  stopwatchOutline, time,} from 'ionicons/icons';
import { TabBarComponent } from '../../components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonSelectOption, IonSelect, IonItem, IonButtons, IonRouterOutlet,
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, TabBarComponent],
})
export class MainPage implements OnInit {
  @ViewChild(TabBarComponent) tabBarComponent!: TabBarComponent;

  activeProfile: 'passenger' | 'driver' | null = null;
  isPassenger = false;
  isDriver = false;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({logOutOutline, car, notifications, time, map, person, refreshOutline, stopwatchOutline,});
  }

  ngOnInit() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      console.log(currentUser);
      this.isPassenger = currentUser.passenger;
      this.isDriver = currentUser.driver;
      this.activeProfile = this.authService.getActiveProfile();

      if (!this.activeProfile) {
        this.activeProfile = this.isPassenger ? 'passenger' : 'driver';
        this.authService.setActiveProfile(this.activeProfile);
      }
      console.log(this.activeProfile);
    } else {
      this.authService.user$.subscribe((user) => {
        if (user) {
          const currentUser = this.authService.currentUserSig();
          console.log(currentUser);
          if (currentUser) {
            this.isPassenger = currentUser.passenger;
            this.isDriver = currentUser.driver;
            this.activeProfile = this.authService.getActiveProfile();

            if (!this.activeProfile) {
              this.activeProfile = this.isPassenger ? 'passenger' : 'driver';
              this.authService.setActiveProfile(this.activeProfile);
            }
          } else {
            console.error('Current user is undefined');
          }
          console.log(this.activeProfile);
        }
      });
    }
  }

  changeProfile(profile: 'passenger' | 'driver') {
    localStorage.removeItem('tripInfo');
    this.activeProfile = profile;
    this.authService.setActiveProfile(profile);

    this,this.isPassenger = profile === 'passenger';
    this.isDriver = profile === 'driver';

    if (this.tabBarComponent) {
      this.tabBarComponent.updateFabButton();
    }

    this.router.navigate([profile === 'driver' ? '/main/map' : '/main/rides']);
  }

  showDropdown(): boolean {
    const currentUrl = this.router.url;
    return (
      (this.activeProfile === 'driver' && currentUrl.includes('/map')) ||
      (this.activeProfile === 'passenger' && currentUrl.includes('/rides'))
    );
  }
}
