import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { car, chatbubbles, flame, logOutOutline, notifications, person, map, search, menu, refreshOutline, 
  stopwatchOutline, time } from 'ionicons/icons';
import { IonTabs, IonFab, IonFabButton, IonIcon, IonTabButton, IonTabBar, 
  IonBadge } from "@ionic/angular/standalone";
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  standalone: true,
  imports: [IonBadge, IonTabBar, IonTabButton, IonIcon, IonFabButton, IonFab, 
    IonTabs, RouterLink]
})
export class TabBarComponent implements OnInit {
  activeProfile: 'passenger' | 'driver' | null = null;
  fabButtonLink = '/main/map';
  fabButtonIcon = 'map';

  newNotificationsCount = 0;

  constructor(private authService: AuthService, private notificationService: NotificationService) {
    addIcons({car,notifications,time,map,person,refreshOutline,stopwatchOutline,logOutOutline,flame,
      search,chatbubbles,menu});
  }

  ngOnInit() {
    this.activeProfile = this.authService.getActiveProfile();

    if (this.activeProfile === 'driver') {
      this.fabButtonLink = '/main/map';
      this.fabButtonIcon = 'map';
    } else {
      this.fabButtonLink = '/main/rides';
      this.fabButtonIcon = 'car';
    }

    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.notificationService.listenForNewNotifications(currentUser.uid, (count) => {
        this.newNotificationsCount = count;
      });
    }
  }

  markNotificationsAsHandled() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.notificationService.markNotificationAsHandled(currentUser.uid);
      this.newNotificationsCount = 0;
    }
  }
}