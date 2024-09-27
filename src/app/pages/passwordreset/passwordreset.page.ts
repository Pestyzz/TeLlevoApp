import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonBackButton, IonButton, IonImg, IonItem, IonCardSubtitle, IonInput, IonCardContent, IonCardTitle, IonCardHeader, IonButtons } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.page.html',
  styleUrls: ['./passwordreset.page.scss'],
  standalone: true,
  imports: [IonButtons, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonCardSubtitle, IonItem, IonImg, 
    IonButton, IonBackButton, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class PasswordresetPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}