import { inject, Injectable, signal } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,
  updateProfile, user, updatePassword
} from '@angular/fire/auth';
import { Firestore, deleteDoc, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, catchError, firstValueFrom, from, Observable, of, switchMap, throwError } from 'rxjs';
import { UserInterface } from '../interfaces/user.interface';
import { VehicleInterface } from '../interfaces/vehicle.interface';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  authStateSubject = new BehaviorSubject<'registered' | 'loggedIn' | null>(null);
  authState$ = this.authStateSubject.asObservable();
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  vehicleSig = signal<VehicleInterface | null | undefined>(undefined);
  activeProfileSig = signal<'passenger' | 'driver' | null>(null);

  constructor(private networkService: NetworkService) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSig.set(JSON.parse(storedUser));
    }

    const storedProfile = localStorage.getItem('activeProfile');
    if (storedProfile) {
      this.activeProfileSig.set(storedProfile as 'passenger' | 'driver');
    }

    const storedVehicle = localStorage.getItem('vehicle');
    if (storedVehicle) {
      this.vehicleSig.set(JSON.parse(storedVehicle));
    }
  }

  login(email: string, password: string): Observable<void> {
    return from(this.networkService.isOnline).pipe(
      catchError(() => {
        return throwError(() => new Error('Network Status check failed'));
      }),
      switchMap(isOnline => {
        if (!isOnline) {
          const storedCredentials = localStorage.getItem('credentials');
          if (storedCredentials) {
            const { email: storedEmail, password: storedPassword } = JSON.parse(storedCredentials);
            if (email === storedEmail && password === storedPassword) {
              this.authStateSubject.next('loggedIn');
              return from(Promise.resolve());
            } else {
              return throwError(() => new Error('Offline mode. Stored credentials do not match'));
            }
          } else {
            return throwError(() => new Error('Offline mode. No stored credentials'));
          }
        }

        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
          .then(async response => {
            this.clearCurrentUser();
            this.clearActiveProfile();
            this.clearVehicle();

            const userDocRef = doc(this.firestore, `user/${response.user.uid}`);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserInterface;
              this.setCurrentUser(userData);

              let activeProfile = this.getActiveProfile();
              if (!activeProfile) {
                if (userData.passenger && !userData.driver) {
                  activeProfile = 'passenger';
                } else if (userData.driver && !userData.passenger) {
                  activeProfile = 'driver';
                } else {
                  activeProfile = 'driver';
                }
                this.setActiveProfile(activeProfile);
              }

              localStorage.setItem('credentials', JSON.stringify({ email, password }));
              this.authStateSubject.next('loggedIn');
            }
          })
          .catch(error => {
            throw new Error(error.code);
          });

        return from(promise);
      })
    )
  }

  signUp(email: string, username: string, password: string, additionalData: any): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(response => {
        return updateProfile(response.user, { displayName: username }).then(async () => {
          const userDocRef = doc(this.firestore, `user/${response.user.uid}`);
          await setDoc(userDocRef, {
            uid: response.user.uid,
            firstName: additionalData.firstName,
            lastName: additionalData.lastName,
            rut: additionalData.rut,
            email: response.user.email,
            phone: additionalData.phone,
            passenger: additionalData.passenger,
            driver: additionalData.driver
          });

          localStorage.setItem('credentials', JSON.stringify({ email, password }));
        });
      })
      .catch(error => {
        throw new Error(error.code);
      });

    this.authStateSubject.next('registered');
    return from(promise);
  }

  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email)
      .then(() => { })
      .catch(error => {
        throw new Error(error.code);
      });

    return from(promise);
  }

  logout() {
    signOut(this.firebaseAuth).then(() => {
      // this.clearCurrentUser();
      // this.clearActiveProfile();
      // this.clearVehicle();
      this.authStateSubject.next(null);
    });
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

  //Vehicle Logic

  async addVehicle(vehicle: VehicleInterface) {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const vehicleRef = doc(this.firestore, `vehicle/${user.uid}`);
      await setDoc(vehicleRef, vehicle);
      this.vehicleSig.set(vehicle);
      localStorage.setItem('vehicle', JSON.stringify(vehicle));
    } else {
      throw new Error('No user logged in');
    }
  }

  async getVehicle(): Promise<VehicleInterface | null> {
    const storedVehicle = localStorage.getItem('vehicle');
    if (storedVehicle) {
      return JSON.parse(storedVehicle) as VehicleInterface;
    }

    const user = this.firebaseAuth.currentUser;
    if (user) {
      const vehicleRef = doc(this.firestore, `vehicle/${user.uid}`);
      const vehicleDoc = await getDoc(vehicleRef);
      if (vehicleDoc.exists()) {
        const vehicleData = vehicleDoc.data() as VehicleInterface;
        this.vehicleSig.set(vehicleData);
        localStorage.setItem('vehicle', JSON.stringify(vehicleData));
        return vehicleData;
      } else {
        return null;
      }
    } else {
      throw new Error('No user logged in');
    }
  }

  async updateVehicle(vehicle: Partial<VehicleInterface>): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const vehicleRef = doc(this.firestore, `vehicle/${user.uid}`);
      await updateDoc(vehicleRef, vehicle);
      const updatedVehicle = { ...this.vehicleSig(), ...vehicle } as VehicleInterface;
      this.vehicleSig.set(updatedVehicle);
      localStorage.setItem('vehicle', JSON.stringify(updatedVehicle));
    } else {
      throw new Error('No user logged in');
    }
  }

  async deleteVehicle() {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const vehicleRef = doc(this.firestore, `vehicles/${user.uid}`);
      await deleteDoc(vehicleRef);
      this.vehicleSig.set(null);
      localStorage.removeItem('vehicle');
    } else {
      throw new Error('No user logged in');
    }
  }

  clearVehicle() {
    this.vehicleSig.set(null);
    localStorage.removeItem('vehicle')
  }
}
