import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonContent, IonFooter } from '@ionic/angular/standalone';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [IonFooter, IonContent, IonTitle, IonToolbar, IonHeader, IonRouterOutlet, CommonModule, FormsModule]
})
export class AuthPage {
  // isSignupRoute = false;
  constructor(private router: Router) {
    // this.router.events.subscribe(event => {
    //   console.log(event);
    //   if (event instanceof NavigationEnd) {
    //     this.isSignupRoute = event.url.includes('signup');
    //   }
    // });
  }

  // onActivate(event: any) {
  //   window.scrollTo(0, 0);
  // }
}