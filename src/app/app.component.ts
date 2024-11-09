import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { doc, getDoc } from '@angular/fire/firestore';
import { UserInterface } from './interfaces/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(async user => {
      if (user) {
        const userDocRef = doc(this.authService.firestore, `user/${user.uid}`);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserInterface;
          this.authService.setCurrentUser({
            firstName: userData.firstName!,
            lastName: userData.lastName!,
            username: user.displayName!,
            rut: userData.rut!,
            email: userData.email!,
            phone: userData.phone!,
            birthdate: userData.birthdate!,
            passenger: userData.passenger!,
            driver: userData.driver!
          });

          let activeProfile = this.authService.getActiveProfile();
          if (!activeProfile) {
            if (userData.passenger && !userData.driver) {
              activeProfile = 'passenger';
            } else if (userData.driver && !userData.passenger) {
              activeProfile = 'driver';
            } else {
              activeProfile = 'driver';
            }
            this.authService.setActiveProfile(activeProfile);
          }

          if (activeProfile === 'passenger') {
            this.router.navigate(['/main/rides']);
          } else if (activeProfile === 'driver') {
            this.router.navigate(['/main/map']);
          }
        }
      } else {
        this.authService.clearCurrentUser();
        this.authService.clearActiveProfile();
        this.router.navigate(['/auth/auth-screen']);
      }
    });
  }
}
