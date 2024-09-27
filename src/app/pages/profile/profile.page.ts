import { Component } from '@angular/core';
import { ModalController, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { ProfileEditModalComponent } from '../../components/profile-edit-modal/profile-edit-modal.component';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonList, IonItem, IonLabel, IonText, IonButton } from "@ionic/angular/standalone";
import { TabBarComponent } from 'src/app/components/tab-bar/tab-bar.component';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, person } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButtons, IonIcon, 
    IonButton, IonText, IonLabel, IonItem, IonList, IonAvatar, IonContent, IonTitle, IonToolbar, IonHeader,
    TabBarComponent, RouterLink
  ]
})
export class ProfilePage {
  userName: string = 'Nombre del Usuario';
  userEmail: string = 'usuario@example.com';
  userPhone: number = 1234567890;

  constructor(private modalController: ModalController) {
    addIcons({arrowBackOutline,person});
  }

  async openEditModal() {
    const modal = await this.modalController.create({
      component: ProfileEditModalComponent,
      componentProps: {
        'name': this.userName,
        'email': this.userEmail,
        'phone': this.userPhone
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.userName = data.data.name;
        this.userEmail = data.data.email;
        this.userPhone = data.data.phone;
      }
    });

    return await modal.present();
  }
}