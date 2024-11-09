import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,
   updateProfile, user, 
   updatePassword} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
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

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSig.set(JSON.parse(storedUser));
    }

    const storedProfile = localStorage.getItem('activeProfile');
    if (storedProfile) {
      this.activeProfileSig.set(storedProfile as 'passenger' | 'driver');
    }
  }

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
          // birthdate: additionalData.birthdate,
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

  getUserData(uid: string): Observable<UserInterface> {
    const userDocRef = doc(this.firestore, `user/${uid}`);
    const promise = getDoc(userDocRef).then(docSnap => {
      if (docSnap.exists()) {
        return docSnap.data() as UserInterface;
      } else {
        throw new Error('User does not exist');
      }
    });

    return from(promise);
  }

  updateProfile(uid: string, profileData: Partial<UserInterface>): Promise<void> {
    const userDocRef = doc(this.firestore, `user/${uid}`);
    return updateDoc(userDocRef, profileData);
  }

  updatePassword(newPassword: string): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return updatePassword(user, newPassword);
    } else {
      return Promise.reject('No user logged in');
    }
  }

  setActiveProfile(profile: 'passenger' | 'driver') {
    this.activeProfileSig.set(profile);
    localStorage.setItem('activeProfile', profile);
  }

  getActiveProfile(): 'passenger' | 'driver' | null {
    return localStorage.getItem('activeProfile') as 'passenger' | 'driver' | null;
  }

  clearActiveProfile() {
    this.activeProfileSig.set(null);
    localStorage.removeItem('activeProfile');
  }

  setCurrentUser(user: UserInterface) {
    this.currentUserSig.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  clearCurrentUser() {
    this.currentUserSig.set(null);
    localStorage.removeItem('currentUser');
  }
}
