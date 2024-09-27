import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { car, chatbubbles, flame, logOutOutline, notifications, person, map, search, menu, refreshOutline, stopwatchOutline, time } from 'ionicons/icons';
import { IonFooter, IonTabs, IonFab, IonFabButton, IonIcon, IonTabButton, IonTabBar, IonBadge, PopoverController } from "@ionic/angular/standalone";
import { RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { NearbyVehiclesComponent } from '../nearby-vehicles/nearby-vehicles.component';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonBadge, IonTabBar, IonTabButton, IonIcon, IonFabButton, IonFab, IonTabs, IonFooter, RouterLink]
})
export class TabBarComponent implements OnInit {
  notificationCount = 0;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private popoverController: PopoverController
  ) {
    addIcons({car,notifications,time,map,person,refreshOutline,stopwatchOutline,logOutOutline,flame,search,chatbubbles,menu});
  }

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notificationCount = notifications.length;
      console.log('Notification count:', this.notificationCount);
    });
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: NearbyVehiclesComponent,
      translucent: true,
      cssClass: 'custom-popover' // Usar la clase CSS personalizada
    });
    await popover.present();
  }
}