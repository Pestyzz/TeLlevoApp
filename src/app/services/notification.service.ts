import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private historySubject = new BehaviorSubject<{ message: string, status: string }[]>([]);
  history$ = this.historySubject.asObservable();

  addNotification(message: string) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, message]);
  }

  addHistory(message: string, status: string) {
    const currentHistory = this.historySubject.value;
    this.historySubject.next([...currentHistory, { message, status }]);
  }
}