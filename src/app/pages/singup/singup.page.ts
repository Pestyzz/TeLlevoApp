import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput, IonButton, IonImg } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-singup',
  templateUrl: './singup.page.html',
  styleUrls: ['./singup.page.scss'],
  standalone: true,
  imports: [IonImg, IonButton, IonInput, IonItem, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader,
    IonCard, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class SingupPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
