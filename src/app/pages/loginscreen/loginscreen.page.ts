import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonImg, IonCardContent, IonItem, IonButton, IonList } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loginscreen',
  templateUrl: './loginscreen.page.html',
  styleUrls: ['./loginscreen.page.scss'],
  standalone: true,
  imports: [IonList, IonButton, IonItem, IonCardContent, IonImg, IonCard, IonBackButton, IonButtons, IonContent,
    IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class LoginscreenPage implements OnInit {
  email: string ='';
  password: string='';

  constructor() { }

  ngOnInit() {
  }

}
