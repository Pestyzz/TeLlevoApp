import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  private networkListener: PluginListenerHandle | null = null;

  constructor() { 
    this.initializeNetworkListener();
  }

  get isOnline() {
    return this.onlineStatus.asObservable();
  }

  private async initializeNetworkListener() {
    const status = await Network.getStatus();
    this.updateOnlineStatus(status.connected);

    this.networkListener = await Network.addListener('networkStatusChange', (status) => {
      this.updateOnlineStatus(status.connected);
    });
  }

  private updateOnlineStatus(status: boolean) {
    this.onlineStatus.next(status);
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}