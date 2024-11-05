import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,
   updateProfile, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { UserInterface } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  activeProfileSig = signal<'passenger' | 'driver' | null>(null);

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(() => {})
    .catch(error => {
      throw new Error(error.code);
    });   
    
    return from(promise);
  }

  signUp(email: string, username: string, password: string, additionalData: any): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(response => {
      return updateProfile(response.user, { displayName: username }).then(() => {
        const userDocRef = doc(this.firestore, `user/${response.user.uid}`);
        return setDoc(userDocRef, {
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          rut: additionalData.rut,
          email: response.user.email,
          phone: additionalData.phone,
          birthdate: additionalData.birthdate,
          passenger: additionalData.passenger,
          driver: additionalData.driver
        });
      });
    })
    .catch(error => {
      throw new Error(error.code);
    });

    return from(promise);
  }

  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email)
    .then(() => {})
    .catch(error => {
      throw new Error(error.code);
    });

    return from(promise);
  }

  logout() {
    signOut(this.firebaseAuth);
  }

  updateProfile(uid: string, profileData: Partial<UserInterface>): Promise<void> {
    const userDocRef = doc(this.firestore, `user/${uid}`);
    return updateDoc(userDocRef, profileData);
  }

  setActiveProfile(profile: 'passenger' | 'driver') {
    this.activeProfileSig.set(profile);
  }
}
