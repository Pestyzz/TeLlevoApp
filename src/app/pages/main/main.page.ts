import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, 
  IonItem, IonLabel, IonSelect, IonSelectOption, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { TabBarComponent } from "../../components/tab-bar/tab-bar.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonSelectOption, IonSelect, IonLabel, IonItem, IonIcon, IonButton, IonButtons, 
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink, TabBarComponent]
})
export class MainPage implements OnInit {
  activeProfile: 'passenger' | 'driver' | null = null;
  isPassenger = false;
  isDriver = false;

  constructor(private authService: AuthService, private router: Router) { 
    addIcons({logOutOutline});
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
