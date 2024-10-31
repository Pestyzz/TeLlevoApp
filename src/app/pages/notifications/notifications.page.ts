import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonLabel, IonList, IonItem, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, notifications, map, person, notificationsOutline, chatbubbles, car } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { TabBarComponent } from "../../components/tab-bar/tab-bar.component";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonItem, IonList, IonLabel, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, FormsModule, RouterLink, TabBarComponent]
})
export class NotificationsPage implements OnInit {
  notifications: string[] = [];

  constructor() {
    addIcons({ arrowBackOutline, notifications, car, chatbubbles, map, person, notificationsOutline });
  }

  ngOnInit() {
  }
}