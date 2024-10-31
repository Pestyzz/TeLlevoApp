import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonItem, IonButton, IonLabel, IonInput, IonBackButton, IonButtons, IonList, IonItemGroup, 
  IonCheckbox } from "@ionic/angular/standalone";

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [IonCheckbox, IonItemGroup, IonList, IonButtons, IonBackButton, IonInput, 
    IonLabel, IonItem, IonButton, FormsModule, ReactiveFormsModule, RouterLink]
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

  constructor(private fb: FormBuilder) {
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
      birthdate: ['', Validators.required],
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

  getEmail() {
    return this.loginForm.controls['email'];
  }

  getPassword() {
    return this.loginForm.controls['password'];
  }
}
