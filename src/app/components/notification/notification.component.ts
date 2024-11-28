import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification" [ngClass]="{ 'online': isOnline, 'offline': !isOnline, 'fade-in-down': show, 'fade-out-up': !show }">
      {{ message }}
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      transition: opacity 0.5s ease-in-out;
      width: calc(100% - 50px);
      max-width: 400px;
    }
    .online {
      background-color: green;
    }
    .offline {
      background-color: red;
    }
    .fade-in-down {
      animation: fadeInDown 0.5s forwards;
    }
    .fade-out-up {
      animation: fadeOutUp 0.5s forwards;
    }
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    @keyframes fadeOutUp {
      from {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
    }
  `],
})
export class NotificationComponent implements OnChanges {
  @Input() isOnline: boolean = true;
  @Input() message: string = '';
  @Input() show: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && this.show) {
      setTimeout(() => {
        this.show = false;
      }, 4000);
    }
  }
}