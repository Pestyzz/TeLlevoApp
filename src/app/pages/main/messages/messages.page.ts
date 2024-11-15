import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonList, IonItem, IonLabel, IonIcon, IonText, IonSpinner } from "@ionic/angular/standalone";
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { chatbubbles, personOutline } from 'ionicons/icons';
import { ChatMessage } from '../../../interfaces/chat-message.interface';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonText, IonIcon, IonLabel, IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonInput, IonButton, JsonPipe]
})
export class MessagesPage implements OnInit {
  chats: any[] = [];
  currentUserUid: string = '';
  userNames: { [key: string]: string } = {};

  constructor(private chatService: ChatService, private authService: AuthService, private router: Router) {
    addIcons({chatbubbles,personOutline});
  }

  ngOnInit() {
    console.log('ngOnInit executed'); // Verificar que ngOnInit se ejecuta
    const currentUser = this.authService.firebaseAuth.currentUser;
    if (currentUser) {
      console.log('Current user:', currentUser.uid); // Verificar que el usuario está autenticado
      this.currentUserUid = currentUser.uid;
      this.authService.getUserData(currentUser.uid).subscribe(user => {
        this.userNames[currentUser.uid] = user.firstName + ' ' + user.lastName;
      });
      this.chatService.getChats(currentUser.uid).subscribe(chats => {
        console.log('Chats:', chats); // Añade un log para verificar los datos
        this.chats = chats;
        this.loadUserNames();
      });
    } else {
      console.log('No user is currently logged in');
    }
  }

  loadUserNames() {
    this.chats.forEach(chat => {
      if (chat.participants && typeof chat.participants === 'object') {
        const participantUids = Object.keys(chat.participants);
        const partnerUid = participantUids.find(uid => uid !== this.currentUserUid);
        console.log('Partner UID:', partnerUid); // Verificar el UID del participante
        if (partnerUid && !this.userNames[partnerUid]) {
          this.authService.getUserData(partnerUid).subscribe(user => {
            console.log('User data:', user); // Verificar los datos del usuario
            this.userNames[partnerUid] = user.firstName + ' ' + user.lastName;
          });
        }
      }
    });
  }

  getChatPartnerName(chat: any): string {
    if (chat.participants && typeof chat.participants === 'object') {
      const participantUids = Object.keys(chat.participants);
      const partnerUid = participantUids.find(uid => uid !== this.currentUserUid);
      console.log('Getting name for UID:', partnerUid); // Verificar el UID del participante
      if (partnerUid) {
        return this.userNames[partnerUid] || 'Unknown';
      }
    }
    return 'Unknown';
  }

  getLastMessage(chat: any): string {
    const messages: ChatMessage[] = Object.values(chat.messages);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const senderName = this.userNames[lastMessage.sender] || 'Unknown';
      return `${senderName}: ${lastMessage.message}`;
    }
    return 'No messages';
  }

  openChat(chatId: string) {
    console.log('Opening chat:', chatId); // Añade un log para verificar los datos
    this.router.navigate(['/main/chat', chatId]);
  }
}