import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonAvatar, IonList, IonItem, 
  IonLabel, IonText, IonButton, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, person } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { UserInterface } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButton, IonText, IonLabel, IonItem, 
    IonList, IonAvatar, IonContent, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  user: UserInterface | null = null;
  profileForm: FormGroup;

  constructor(private authService: AuthService, private fb: FormBuilder, private alertController: AlertController) {
    addIcons({arrowBackOutline, person});

    this.profileForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.min(111111111), Validators.max(999999999)]],
      birthdate: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.getUserData(user.uid).subscribe(userData => {
          this.user = userData;
        });
      }
    });
  }

  updateProfile(userData: any) {
    if (this.user) {
      const updatedData: Partial<UserInterface> = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        rut: userData.rut,
        email: userData.email,
        phone: userData.phone,
        birthdate: new Date(userData.birthdate)
      };

      this.authService.user$.subscribe(user => {
        if (user) {
          this.authService.updateProfile(user.uid, updatedData);
        }
      });
    }
  }

  handleSave(data: any) {
    this.profileForm.patchValue(data);

    if (this.profileForm.valid) {
      this.updateProfile(data);
    } else {
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos correctamente',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  async openEditAlert() {
    const alert = await this.alertController.create({
      header: 'Editar Perfil',
      inputs: [
        { name: 'firstName', type: 'text', placeholder: 'Nombre', value: this.profileForm.get('firstName')?.value },
        { name: 'lastName', type: 'text', placeholder: 'Apellido', value: this.profileForm.get('lastName')?.value },
        { name: 'rut', type: 'text', placeholder: 'EJ: 1234456K', value: this.profileForm.get('rut')?.value },
        { name: 'email', type: 'email', placeholder: 'EJ: ejemplo@gmail.com', value: this.profileForm.get('email')?.value },
        { name: 'password', type: 'text', placeholder: 'Contraseña (Min 6 caracteres)', value: this.profileForm.get('password')?.value },
        { name: 'confirmPass', type: 'text', placeholder: 'Confirmar Contraseña', value: this.profileForm.get('confirmPass')?.value },
        { name: 'phone', type: 'number', placeholder: 'Teléfono (+56 9)', value: this.profileForm.get('phone')?.value },
        { name: 'birthdate', type: 'date', value: this.profileForm.get('birthdate')?.value }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: data => this.handleSave(data) }
      ],
    });

    await alert.present();
  }

  logout() {
    this.authService.logout();
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Estás seguro de que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', handler: () => this.logout() }

      ]
    });

    await alert.present();
  }
}
