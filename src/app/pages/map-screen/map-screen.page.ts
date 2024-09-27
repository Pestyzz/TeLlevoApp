import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonButton, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonIcon } from "@ionic/angular/standalone";
import { logOutOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import { TabBarComponent } from 'src/app/components/tab-bar/tab-bar.component';
import { MapComponent } from 'src/app/components/map/map.component';

@Component({
  selector: 'app-map-screen',
  templateUrl: './map-screen.page.html',
  styleUrls: ['./map-screen.page.scss'],
  standalone: true,
  imports: [IonIcon, IonBackButton,
    IonButtons, IonContent, IonTitle, IonToolbar, IonButton, IonHeader,
    CommonModule, FormsModule, RouterLink, TabBarComponent, MapComponent]
})
export class MapScreenPage implements OnInit {

  constructor() { 
    addIcons({logOutOutline});
  }

  ngOnInit() {
  }
}
