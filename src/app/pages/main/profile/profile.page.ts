import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonAvatar, IonList, IonItem, 
  IonLabel, IonText, IonButton, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, person } from 'ionicons/icons';
import { ProfileEditModalComponent } from 'src/app/components/profile-edit-modal/profile-edit-modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButton, IonText, IonLabel, IonItem, 
    IonList, IonAvatar, IonContent, CommonModule, FormsModule]
})
export class ProfilePage {
  userName: string = 'Nombre del Usuario';
  userEmail: string = 'usuario@example.com';
  userPhone: number = 1234567890;

  constructor(private authService: AuthService, private modalController: ModalController) {
    addIcons({arrowBackOutline, person});
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

  logout() {
    this.authService.logout();
  }
}
