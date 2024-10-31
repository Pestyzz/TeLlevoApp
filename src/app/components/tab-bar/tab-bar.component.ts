import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { car, chatbubbles, flame, logOutOutline, notifications, person, map, search, menu, refreshOutline, stopwatchOutline, time } from 'ionicons/icons';
import { IonFooter, IonTabs, IonFab, IonFabButton, IonIcon, IonTabButton, IonTabBar, IonBadge } from "@ionic/angular/standalone";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonBadge, IonTabBar, IonTabButton, IonIcon, IonFabButton, IonFab, IonTabs, IonFooter, RouterLink]
})
export class TabBarComponent implements OnInit {
  notificationCount = 0;

  constructor() {
    addIcons({car,notifications,time,map,person,refreshOutline,stopwatchOutline,logOutOutline,flame,search,chatbubbles,menu});
  }

  ngOnInit() {
  }
}