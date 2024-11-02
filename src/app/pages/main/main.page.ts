import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { TabBarComponent } from "../../components/tab-bar/tab-bar.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    RouterLink, TabBarComponent]
})
export class MainPage implements OnInit {
  profile: 'passegner' | 'driver' = 'driver';
  section: 'notifications' | 'history' | 'rides' | 'profile' | 'map' = 'map';

  constructor(private authService: AuthService) { 
    addIcons({logOutOutline});
  }

  ngOnInit() {
  }

}
