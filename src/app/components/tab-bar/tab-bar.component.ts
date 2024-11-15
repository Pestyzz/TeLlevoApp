import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { car, chatbubbles, flame, logOutOutline, notifications, person, map, search, menu, refreshOutline, 
  stopwatchOutline, time } from 'ionicons/icons';
import { IonTabs, IonFab, IonFabButton, IonIcon, IonTabButton, IonTabBar, 
  IonBadge } from "@ionic/angular/standalone";
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ChatService } from 'src/app/services/chat.service';

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
  newMessagesCount = 0;

  constructor(private authService: AuthService, private notificationService: NotificationService, 
    private chatService: ChatService, private router: Router) {
    addIcons({car,notifications,time,map,person,refreshOutline,stopwatchOutline,logOutOutline,flame,
      search,chatbubbles,menu});
  }

  ngOnInit() {
    this.updateFabButton();

    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.notificationService.listenForNewNotifications(currentUser.uid, (count) => {
        this.newNotificationsCount = count;
      });

      this.chatService.listenForNewMessages(currentUser.uid, (count) => {
        this.newMessagesCount = count;
      });

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd && event.url === '/main/messages') {
          this.newMessagesCount = 0;
          this.chatService.getChats(currentUser.uid).subscribe(chats => {
            chats.forEach(chat => {
              this.chatService.markMessagesAsRead(chat.id, currentUser.uid);
            });
          });
        }
      });
    }
  }

  updateFabButton() {
    this.activeProfile = this.authService.getActiveProfile();

    if (this.activeProfile === 'driver') {
      this.fabButtonLink = '/main/map';
      this.fabButtonIcon = 'map';
    } else {
      this.fabButtonLink = '/main/rides';
      this.fabButtonIcon = 'car';
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