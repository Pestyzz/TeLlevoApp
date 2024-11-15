import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(async user => {
      if (user) {
        const userDocRef = doc(this.authService.firestore, `user/${user.uid}`);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserInterface;
          this.authService.setCurrentUser(userData);

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

          this.cdr.detectChanges();
        } else {
          console.error('User document does not exist');
          this.authService.clearCurrentUser();
          this.authService.clearActiveProfile();
          this.router.navigate(['/auth/auth-screen']);
        }
      } else {
        this.authService.clearCurrentUser();
        this.authService.clearActiveProfile();
        this.router.navigate(['/auth/auth-screen']);
      }
    });
  }
}