import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonItem, IonButton, IonInput, IonBackButton, IonButtons, IonList, 
  IonCheckbox, AlertController } from "@ionic/angular/standalone";
import { AuthService } from './../../services/auth.service';


@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [IonCheckbox, IonList, IonButtons, IonBackButton, IonInput, 
    IonItem, IonButton, FormsModule, ReactiveFormsModule, RouterLink]
})
export class AuthFormComponent {
  @Input() currentForm: 'login' | 'signup' | 'forgot-password' = 'login';
  
  loginForm: FormGroup;
  signupForm: FormGroup;
  forgotPasswordForm: FormGroup;

  checkboxes = {
    passenger: false,
    driver: false
  };

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router,
    private alertController: AlertController) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.min(111111111), Validators.max(999999999)]],
      passenger: [false],
      driver: [false]
    }, { validators: this.checkboxValidator });

    this.forgotPasswordForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  checkboxValidator(control: AbstractControl) {
    const passenger = control.get('passenger')?.value;
    const driver = control.get('driver')?.value;
    if (!passenger && !driver) {
      return { checkboxValidator: true };
    }
    return null;
  }

  onCheckboxChange(checkbox: 'passenger' | 'driver') {
    if (checkbox === 'passenger') {
      this.checkboxes.driver = false;
    } else if (checkbox === 'driver') {
      this.checkboxes.passenger = false;
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  onSubmit() {
    if (this.currentForm === 'login') {
      const rawForm = this.loginForm.getRawValue();

      this.authService.login(rawForm.email, rawForm.password).subscribe({
        next: () => {
          this.router.navigateByUrl('/main');
        },
        error: (error) => {
          console.error('Error logging in:', error);
          let errorMessage = 'Introduzca un email y contraseña válidos.';
          if (error.message === 'auth/invalid-credential') {
            errorMessage = 'Datos inválidos. Por favor, inténtelo de nuevo.';
          } else if (error.message === 'auth/missing-password') {
            errorMessage = 'Contraseña faltante. Por favor, inténtelo de nuevo.';
          } else if (error.message === 'auth/wrong-password') {
            errorMessage = 'Contraseña incorrecta. Por favor, inténtelo de nuevo.';
          } else if (error.message === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Por favor, inténtelo de nuevo.';
          }
          this.presentAlert('Error de Inicio de Sesión', errorMessage);
        }
      });
    } else if (this.currentForm === 'signup') {
      if (this.signupForm.invalid) {
        this.presentAlert('Error de Registro', 'Introduzca datos válidos.');
        return;
      }

      const rawForm = this.signupForm.getRawValue()
      const username = rawForm.firstName + ' ' + rawForm.lastName;
      const additionalData = {
        firstName: rawForm.firstName as string,
        lastName: rawForm.lastName as string,
        rut: rawForm.rut as string,
        phone: rawForm.phone as number,
        birthdate: rawForm.birthdate as Date,
        passenger: rawForm.passenger as boolean,
        driver: rawForm.driver as boolean
      };

      this.authService.signUp(rawForm.email, username, rawForm.password, additionalData).subscribe({
        next: () => {
          this.router.navigateByUrl('/main');
        },
        error: (error) => {
          console.error('Error signin up:', error);
          let errorMessage = 'Introduzca datos válidos.';
          if (error.message === 'auth/email-already-in-use') {
            errorMessage = 'Email ya en uso. Por favor, elija otro.';
          } else if (error.message === 'auth/weak-password') {
            errorMessage = 'Contraseña débil. Por favor, elija otra.';
          } else if (error.message === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Por favor, elija otro.';
          }
          this.presentAlert('Error de Registro', errorMessage);
        }
      });
    } else {
      const rawForm = this.forgotPasswordForm.getRawValue();

      this.authService.resetPassword(rawForm.email).subscribe({
        next: () => {
          console.log('Email sent');
        },
        error: (error) => {
          console.error('Error sending email:', error);
          let errorMessage = 'Introduzca un email.';
          if (error.message === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Por favor, inténtelo de nuevo.';
          } else if (error.message === 'auth/user-not-found') {
            errorMessage = 'Usuario no encontrado. Por favor, inténtelo de nuevo.';
          }
          this.presentAlert('Error de Recuperación de Contraseña', errorMessage);
        }
      });
    }
  }
}
