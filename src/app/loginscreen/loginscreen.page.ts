import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonImg, IonCardContent, IonItem, IonInput, IonIcon, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-loginscreen',
  templateUrl: './loginscreen.page.html',
  styleUrls: ['./loginscreen.page.scss'],
  standalone: true,
  imports: [IonLabel, IonIcon, IonInput, IonItem, IonCardContent, IonImg, IonCard, IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginscreenPage implements OnInit {
email: string ='';
password: string='';

  constructor() { }

  ngOnInit() {
  }

}
