import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonIcon } from '@ionic/angular/standalone';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonList } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { createOutline, close } from 'ionicons/icons';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
  standalone: true,
  imports: [IonIcon, IonList, IonButtons, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, FormsModule
  ]
})
export class ProfileEditModalComponent {
  @Input() name: string = '';
  @Input() email: string = '';
  @Input() phone: number = 0;

  constructor(private modalController: ModalController) {
    addIcons({close,createOutline});
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true,
      'name': this.name,
      'email': this.email,
      'phone': this.phone
    });
  }
}