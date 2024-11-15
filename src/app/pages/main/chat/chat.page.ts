import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonInput, IonButton, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { paperPlane } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonIcon, IonFooter, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, CommonModule, FormsModule]
})
export class ChatPage implements OnInit {
  chatId: string = '';
  messages: any[] = [];
  newMessage: string = '';
  currentUserUid: string = '';
  userNames: { [key: string]: string } = {};
  chatName: string = '';

  constructor(private route: ActivatedRoute, private chatService: ChatService, private authService: AuthService) { 
    addIcons({paperPlane});
    this.chatId = this.route.snapshot.paramMap.get('chatId')!;
  }

  ngOnInit() {
    const currentUser = this.authService.firebaseAuth.currentUser;
    if (currentUser) {
      this.currentUserUid = currentUser.uid;
      this.chatService.getChatMessages(this.chatId).subscribe(messages => {
        this.messages = messages;
      });
      this.loadUserNames();
    }
  }

  loadUserNames() {
    // Load user names for participants
    this.chatService.getChats(this.currentUserUid).subscribe(chats => {
      chats.forEach(chat => {
        Object.keys(chat.participants).forEach(uid => {
          if (!this.userNames[uid]) {
            this.authService.getUserData(uid).subscribe(user => {
              this.userNames[uid] = user.firstName + ' ' + user.lastName;
              if (uid !== this.currentUserUid) {
                this.chatName = this.userNames[uid];
              }
            });
          }
        });
      });
    });
  }

  getUserName(uid: string): string {
    return this.userNames[uid] || 'Unknown';
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const driverUid = this.chatId.split('_').find(uid => uid !== this.currentUserUid);
      this.chatService.createOrUpdateChat(driverUid!, this.newMessage).then(() => {
        this.newMessage = '';
      });
    }
  }
}