import { Injectable } from '@angular/core';
import { Database, get, onValue, push, ref, set } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private database: Database, private authService: AuthService) { }

  async createOrUpdateChat(driverUid: string, message: string) {
    const currentUser = this.authService.firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }
  
    const passengerUid = currentUser.uid;
    const chatId = passengerUid < driverUid ? `${passengerUid}_${driverUid}` : `${driverUid}_${passengerUid}`;
    const chatRef = ref(this.database, `chats/${chatId}`);
    const chatSnapshot = await get(chatRef);
  
    if (chatSnapshot.exists()) {
      // Update existing chat
      const newMessageRef = push(ref(this.database, `chats/${chatId}/messages`));
      await set(newMessageRef, {
        sender: passengerUid,
        message,
        timestamp: Date.now(),
        read: false
      });
    } else {
      // Create new chat
      await set(chatRef, {
        participants: {
          [passengerUid]: true,
          [driverUid]: true
        },
        messages: {
          [push(ref(this.database, `chats/${chatId}/messages`)).key!]: {
            sender: passengerUid,
            message,
            timestamp: Date.now(),
            read: false
          }
        }
      });
    }
  }

  getChats(uid: string): Observable<any[]> {
    const chatsRef = ref(this.database, `chats`);
    return new Observable(observer => {
      onValue(chatsRef, snapshot => {
        const chats: any[] = [];
        snapshot.forEach(childSnapshot => {
          const chat = childSnapshot.val();
          chat.id = childSnapshot.key; // Asigna el ID del chat
          if (chat.participants[uid]) {
            chats.push(chat);
          }
        });
        console.log('Emitting chats:', chats); // Añade un log para verificar los datos
        observer.next(chats);
      });
    });
  }

  getChatMessages(chatId: string): Observable<any[]> {
    const messagesRef = ref(this.database, `chats/${chatId}/messages`);
    return new Observable(observer => {
      onValue(messagesRef, snapshot => {
        const messages: any[] = [];
        snapshot.forEach(childSnapshot => {
          messages.push(childSnapshot.val());
        });
        observer.next(messages);
      });
    });
  }

  listenForNewMessages(uid: string, callback: (count: number) => void) {
    const chatsRef = ref(this.database, `chats`);
    onValue(chatsRef, snapshot => {
      let newMessagesCount = 0;
      snapshot.forEach(childSnapshot => {
        const chat = childSnapshot.val();
        if (chat.participants[uid]) {
          const messages = Object.values(chat.messages);
          messages.forEach((message: any) => {
            if (message.sender !== uid && !message.read) {
              newMessagesCount++;
            }
          });
        }
      });
      callback(newMessagesCount);
    });
  }

  markMessagesAsRead(chatId: string, uid: string) {
    const messagesRef = ref(this.database, `chats/${chatId}/messages`);
    get(messagesRef).then(snapshot => {
      snapshot.forEach(childSnapshot => {
        const messageRef = childSnapshot.ref;
        const message = childSnapshot.val();
        if (message.sender !== uid && !message.read) {
          set(messageRef, { ...message, read: true });
        }
      });
    });
  }
}
