import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButtons, IonButton, IonIcon, IonAvatar } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, time, carOutline } from 'ionicons/icons';
import { TabBarComponent } from "../../components/tab-bar/tab-bar.component";

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonIcon, IonButton, IonButtons, IonLabel, IonItem, IonList, IonContent, IonTitle, IonToolbar,
    IonHeader, CommonModule, RouterLink, TabBarComponent]
})
export class HistoryPage implements OnInit {
  history: { message: string, status: string }[] = [];

  constructor() {
    addIcons({arrowBackOutline,time,carOutline});
  }

  ngOnInit() {
  }
}