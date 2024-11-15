import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonAvatar, IonList, IonItem, IonLabel, IonText, IonButton, 
  AlertController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, person, trashOutline, addOutline, addCircleOutline, createOutline, 
  logOutOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { UserInterface } from 'src/app/interfaces/user.interface';
import { RutFormatPipe } from 'src/app/pipes/rut-format.pipe';
import { VehicleInterface } from 'src/app/interfaces/vehicle.interface';
import { plateValidator } from 'src/app/validators/plate.validator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonText, IonLabel, IonItem, 
    IonList, IonAvatar, CommonModule, FormsModule, RutFormatPipe]
})
export class ProfilePage implements OnInit, OnDestroy {
  user: UserInterface | null = null;
  vehicle: VehicleInterface | null = null;
  profileForm: FormGroup;
  vehicleForm: FormGroup;
  activeProfile: 'passenger' | 'driver' | null = null;
  private profileSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private fb: FormBuilder, private alertController: AlertController) {
    addIcons({createOutline,logOutOutline,trashOutline,addCircleOutline,addOutline,arrowBackOutline,person});

    this.profileForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.min(111111111), Validators.max(999999999)]]
    });

    this.vehicleForm = this.fb.nonNullable.group({
      plate: ['', [Validators.required, plateValidator()]],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      color: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(2)]]
    });

    effect(() => {
      this.activeProfile = this.authService.activeProfileSig();
      if (this.activeProfile === 'driver') {
        this.loadVehicle();
      } else {
        this.vehicle = null;
      }
    });

    this.loadUserData();
  }

  ngOnInit() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser) as UserInterface;
      this.user = userData;
      this.profileForm.patchValue(userData);
    } else {
      this.authService.user$.subscribe(user => {
        if (user) {
          this.authService.getUserData(user.uid).subscribe(userData => {
            this.user = userData;
            this.profileForm.patchValue(userData);
          });
        }
      });
    }

    this.activeProfile = this.authService.getActiveProfile();
    if (this.activeProfile === 'driver') {
      this.loadVehicle();
    }
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  loadUserData() {
    effect(() => {
      const user = this.authService.currentUserSig();
      if (user) {
        this.user = user;
        this.profileForm.patchValue(user);
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
        phone: userData.phone
      };

      this.authService.user$.subscribe(user => {
        if (user) {
          this.authService.updateProfile(user.uid, updatedData).then(() => {
            this.user = { ...this.user, ...updatedData } as UserInterface;
            this.profileForm.patchValue(updatedData);
            localStorage.setItem('currentUser', JSON.stringify(this.user));
          });
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
        { name: 'password', type: 'password', placeholder: 'Contraseña (Min 6 caracteres)', value: this.profileForm.get('password')?.value },
        { name: 'confirmPass', type: 'password', placeholder: 'Confirmar Contraseña', value: this.profileForm.get('confirmPass')?.value },
        { name: 'phone', type: 'number', placeholder: 'Teléfono (+56 9)', value: this.profileForm.get('phone')?.value }
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
    this.user = null;
    this.vehicle = null;
    this.profileForm.reset();
    this.vehicleForm.reset();
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

  // Vehicle Logic

  async loadVehicle() {
    try {
      this.vehicle = await this.authService.getVehicle();
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  }

  async saveVehicle(isEdit: boolean) {
    if (this.vehicleForm.valid) {
      try {
        if (isEdit) {
          await this.authService.updateVehicle(this.vehicleForm.value);
          alert('Vehículo actualizado con éxito')
        } else {
          await this.authService.addVehicle(this.vehicleForm.value);
          alert('Vehículo añadido con éxito');
        }
        this.loadVehicle();
      } catch (error) {
        console.error('Error saving vehicle:', error);
        alert('Error guardando vehículo');
      }
    } else {
      alert('Por favor, complete todos los campos del formulario.');
    }
  }

  async openVehicleAlert(isEdit: boolean) {
    const vehicleData = isEdit && this.vehicle 
    ? this.vehicle 
    : { plate: '', brand: '', model: '', color: '', capacity: null };

    const alert = await this.alertController.create({
      header: isEdit ? 'Editar Vehículo' : 'Añadir Vehículo' ,
      inputs: [
        { name: 'plate', type: 'text', placeholder: 'Patente', value: vehicleData.plate },
        { name: 'brand', type: 'text', placeholder: 'Marca', value: vehicleData.brand },
        { name: 'model', type: 'text', placeholder: 'Modelo', value: vehicleData.model },
        { name: 'color', type: 'text', placeholder: 'Color', value: vehicleData.color },
        { name: 'capacity', type: 'number', placeholder: 'Capacidad', value: vehicleData.capacity }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: isEdit ? 'Guardar' : 'Añadir', handler: data => this.handleVehicle(data, isEdit) }
      ]
    });

    await alert.present();
  }

  handleVehicle(data: any, isEdit: boolean) {
    this.vehicleForm.patchValue(data);

    if (this.vehicleForm.valid) {
      this.saveVehicle(isEdit);
    } else {
      this.alertController.create({
        header: 'Error',
        message: 'Por favor, complete todos los campos correctamente.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  async deleteVehicle() {
    try {
      await this.authService.deleteVehicle();
      this.vehicle = null;
      alert('Vehículo eliminado con éxito');
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      alert('Error eliminando vehículo');
    }
  }
}
