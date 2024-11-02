import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { doc, getDoc } from '@angular/fire/firestore';
import { UserInterface } from './interfaces/user.interface';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(async user => {
      if (user) {
        const userDocRef = doc(this.authService.firestore, `user/${user.uid}`);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserInterface;
          this.authService.currentUserSig.set({
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
        }
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });
  }

  logout() {
    this.authService.logout();
  }
}
