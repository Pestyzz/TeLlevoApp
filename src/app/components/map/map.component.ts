import { OnInit, Component, ElementRef, ViewChild, ViewEncapsulation, 
  ChangeDetectorRef, 
  OnDestroy} from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Database, off, ref, set, update } from '@angular/fire/database';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TripInterface } from 'src/app/interfaces/trip.interface';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput, IonButton, 
  IonList, IonIcon, IonButtons } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { locationOutline, golfOutline, timeOutline, cashOutline, arrowUpOutline, closeOutline, speedometerOutline, add } from 'ionicons/icons';
import { PriceFormatPipe } from 'src/app/pipes/price-format.pipe';
import { TripService } from 'src/app/services/trip.service';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonButtons, IonIcon, IonList, IonButton, IonInput, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonCard, 
    PriceFormatPipe]
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('map') mapElementRef!: ElementRef;
  map: any;
  mapListener: any;
  originMarker: any;
  destinationMarker: any;
  directionsService: any;
  directionsRenderer: any;
  center = { lat: 0, lng: 0 };

  activeProfile: 'passenger' | 'driver' | null;

  tripInfo: TripInterface | null = null;
  tripPublished = false;
  tripStarted = false;
  tripInfoMinimized = false;
  requestSent = false;

  constructor(private authService: AuthService, private database: Database, private router: Router, 
    private alertController: AlertController, private cdr: ChangeDetectorRef, private tripService: TripService) {
      addIcons({locationOutline,golfOutline,speedometerOutline,timeOutline,cashOutline,add,closeOutline,arrowUpOutline});
      this.activeProfile = this.authService.getActiveProfile();
  }

  ngOnInit() {
    this.loadMap();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#ff6c70',
        strokeOpacity: 0.9,
        strokeWeight: 4
      }
    });
    this.directionsRenderer.setMap(this.map);

    const currentUser = this.authService.currentUserSig();
    const navigation = this.router.getCurrentNavigation();
  
    if (this.activeProfile === 'passenger') {
      if (navigation?.extras.state) {
        this.tripInfo = navigation.extras.state['trip'];
        localStorage.setItem('tripInfo', JSON.stringify(this.tripInfo)); // Guardar los datos del viaje en localStorage
      } else {
        const storedTripInfo = localStorage.getItem('tripInfo');
        if (storedTripInfo) {
          this.tripInfo = JSON.parse(storedTripInfo); // Cargar los datos del viaje desde localStorage
        }
      }
      if (currentUser) {
        this.tripService.listenForPassengerNotifications(currentUser.uid, (notifications) => {
          notifications.forEach(notification => {
            if (notification.type === 'response' && !notification.handled) {
              this.handlePassengerNotification(notification);
            }
          });
        });
      }
    } else if (this.activeProfile === 'driver') {
      if (navigation?.extras.state) {
        this.tripInfo = navigation.extras.state['trip'];
        localStorage.setItem('tripInfo', JSON.stringify(this.tripInfo)); // Guardar los datos del viaje en localStorage
      } else {
        const storedTripInfo = localStorage.getItem('tripInfo');
        if (storedTripInfo) {
          this.tripInfo = JSON.parse(storedTripInfo); // Cargar los datos del viaje desde localStorage
          this.calculateAndDisplayRoute(this.tripInfo?.origin.coords!, this.tripInfo?.destination.coords!);
        }
      }
      if (currentUser) {
        this.tripService.listenForJoinRequests(currentUser.uid, (request) => {
          this.handleJoinRequest(request);
          // Manejar las solicitudes de unirse al viaje aquí
        });
      }
    }
  
    // Verificar si el viaje está publicado
    if (this.tripInfo && this.tripInfo.status === 'published') {
      this.tripPublished = true;
    }
  }

  ngOnDestroy() {
    this.tripService.stopListeningForJoinRequests();
  }

  async loadMap() {
    console.log('Loading map...');

    const position = await Geolocation.getCurrentPosition();
    this.center = { 
      lat: position.coords.latitude, 
      lng: position.coords.longitude 
    };

    const { Map } = await google.maps.importLibrary("maps");
    const { Autocomplete } = await google.maps.importLibrary("places");
    
    const mapOptions = {
      center: this.center,
      zoom: 18,
      mapId: '977b8df018511dc6',
      disableDefaultUI: true
    };

    this.map = new Map(this.mapElementRef.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#ff6c70',
        strokeOpacity: 0.9,
        strokeWeight: 4
      }
    });
    this.directionsRenderer.setMap(this.map);

    if (this.activeProfile === 'driver') {
      this.setDriverMode(Autocomplete);
    } else if (this.activeProfile === 'passenger') {
      if (this.tripInfo) {
        this.displayTripInfo();
      }
    }
  }

  //Driver Logic

  async setDriverMode(Autocomplete: any) {
    const input = document.getElementById('pac-input') as HTMLInputElement;
    const autocomplete = new Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        console.error('No details available for input: ' + place.name);
        return;
      }

      const position = await Geolocation.getCurrentPosition();
      const origin = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const destination = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      this.calculateRoute(origin, destination);
      this.calculateAndDisplayRoute(origin, destination);

      const driverUid = this.authService.firebaseAuth.currentUser?.uid;
      if (driverUid) {
        console.log('Driver UID:', driverUid);
        this.tripService.listenForJoinRequests(driverUid, (request) => {
          console.log('Join request:', request);
          this.handleJoinRequest(request);
        });
        console.log('Listening for join requests...');
      }

      this.cdr.detectChanges();
    });
  }

  calculateRoute(origin: any, destination: any) {
    this.directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(response);
          const route = response.routes[0].legs[0];
          const distance = parseFloat(route.distance.text.replace(' km', ''));
          const price = this.calculatePrice(distance);
          const currentUser = this.authService.currentUserSig();
          const currentVehicle = this.authService.vehicleSig();
          if (!currentUser || !currentVehicle) {
            console.error('User or vehicle information is missing');
            return;
          }
          this.tripInfo = {
            driver: {
              uid: currentUser.uid,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              rut: currentUser.rut,
              email: currentUser.email,
              phone: currentUser.phone,

            },
            vehicle: {
              plate: currentVehicle.plate,
              brand: currentVehicle.brand,
              model: currentVehicle.model,
              // year: currentVehicle.year,
              color: currentVehicle.color,
              capacity: currentVehicle.capacity
            },
            origin: {
              name: route.start_address,
              coords: origin
            },
            destination: {
              name: route.end_address,
              coords: destination
            },
            distance: route.distance.text,
            duration: route.duration.text,
            price: price,
            passengers: [],
            status: 'published'
          };
          this.cdr.detectChanges();
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }

  calculatePrice(distance: number): number {
    const baseFare = 1000;
    const costPerKm = 370;
    return baseFare + (costPerKm * distance)
  }

  async publishTrip() {
    const publishAlert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas publicar este viaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Publicar viaje',
          handler: async () => {
            if (!this.tripInfo) {
              console.error('Trip information is missing');
              return;
            }
            const tripRef = ref(this.database, `trip/${this.authService.firebaseAuth.currentUser?.uid}`);
            localStorage.setItem('tripInfo', JSON.stringify(this.tripInfo));
            await set(tripRef, this.tripInfo);
            this.tripPublished = true;
            this.cdr.detectChanges();
          },
        }
      ]
    });

    await publishAlert.present();
  }

  startTrip() {
    if (this.tripInfo) {
      this.tripInfo.status = 'started';
    }
    const tripRef = ref(this.database, `trip/${this.authService.firebaseAuth.currentUser?.uid}`);
    update(tripRef, { status: 'started' })
    // localStorage.setItem('currentTrip', JSON.stringify(this.tripInfo));
    this.tripStarted = true;
    this.tripService.startTrip();
    this.router.navigate(['/main/map']);
  }

  completeCurrentTrip() {
    if (this.tripInfo) {
      this.tripInfo.status = 'completed';
    }
    const driverUid = this.authService.firebaseAuth.currentUser?.uid;
    const tripRef = ref(this.database, `trip/${driverUid!}`);
    update(tripRef, { status: 'completed' }).then(() => {
      localStorage.removeItem('tripInfo');
    });
    this.tripStarted = false;
    this.tripService.completeTrip(driverUid!);
    this.tripPublished = false;
    this.tripInfo = null;
    this.directionsRenderer.set('directions', null);
    this.originMarker.setMap(null);
    this.originMarker = null;
    this.destinationMarker.setMap(null);
    this.destinationMarker = null;

    this.cdr.detectChanges();
  }

  cancelTrip() {
    this.tripPublished = false;
    this.tripInfo = null;
    this.directionsRenderer.set('directions', null);
    localStorage.removeItem('currentTrip');
    this.originMarker.setMap(null);
    this.originMarker = null;
    this.destinationMarker.setMap(null);
    this.destinationMarker = null;
    
    this.cdr.detectChanges();
  }

  handleButtonClick() {
    if (!this.tripPublished) {
      this.publishTrip();
    } else if (!this.tripStarted) {
      this.startTrip();
    } else {
      this.completeCurrentTrip();
    }
  }

  getButtonLabel() {
    if (!this.tripPublished) {
      return 'Publicar Viaje';
    } else if (!this.tripStarted) {
      return 'Comenzar Viaje';
    } else {
      return 'Finalizar Viaje';
    }
  }

  toggleTripInfo() {
    this.tripInfoMinimized = !this.tripInfoMinimized;
    this.cdr.detectChanges();
  }

  calculateAndDisplayRoute(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) {
    this.directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);

        if (this.originMarker) {
          this.originMarker.setMap(null);
        }
        if (this.destinationMarker) {
          this.destinationMarker.setMap(null);
        }

        this.originMarker = this.addCustomMarker(origin, 'Origin', 'assets/map/OriginIconPin.png');
        this.destinationMarker = this.addCustomMarker(destination, 'Destination', 'assets/map/DestinationIconPin.png');
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  addCustomMarker(position: { lat: number, lng: number }, title: string, iconUrl: string) {
    const { AdvancedMarkerElement } = google.maps.marker;

    const markerContent = document.createElement('div');
    markerContent.innerHTML = `
      <div>
        <img src="${iconUrl}" style="width: 50px; height: 50px;">
      </div>
    `;

    return new AdvancedMarkerElement({
      position,
      map: this.map,
      title,
      content: markerContent
    });
  }

  //Passenger Logic

  displayTripInfo() {
    if (!this.tripInfo) {
      console.error('Trip information is missing');
      return;
    }

    const origin = this.tripInfo.origin.coords;
    const destination = this.tripInfo.destination.coords;

    this.calculateAndDisplayRoute(origin, destination);
  }

  navigateToRides() {
    this.router.navigate(['/main/rides']);
  }

  async requestToJoinTrip() {
    if (!this.tripInfo) {
      console.error('Trip information is missing');
      return;
    }

    const currentUser = this.authService.currentUserSig();
    if (!currentUser) {
      console.error('User information is missing');
      return;
    }

    if (this.requestSent) {
      const alert = await this.alertController.create({
        header: 'Solicitud ya enviada',
        message: 'Ya has enviado una solicitud para unirte a este viaje.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

    try {
      await this.tripService.requestToJoinTrip(this.tripInfo.driver.uid, {
        uid: currentUser.uid,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        rut: currentUser.rut,
        email: currentUser.email,
        phone: currentUser.phone
      });

      this.requestSent = true;

      const alert = await this.alertController.create({
        header: 'Solicitud enviada',
        message: 'Tu solicitud para unirte al viaje ha sido enviada con éxito.',
        buttons: ['OK']
      });

      await alert.present();
    } catch (error) {
      console.error('Error sending join request:', error);
    }
  }

  async handleJoinRequest(request: any) {
    const driverName = `${this.tripInfo?.driver.firstName} ${this.tripInfo?.driver.lastName}`;

    const alert = await this.alertController.create({
      header: 'Solicitud de pasajero',
      message: `${request.firstName} ${request.lastName} desea unirse a tu viaje.`,
      buttons: [
        {
          text: 'Rechazar',
          role: 'cancel',
          handler: async () => {
            try {
              await this.tripService.rejectPassenger(this.tripInfo?.driver.uid!, request.uid, driverName);
              await this.updateNotificationHandledStatus(this.tripInfo?.driver.uid!, request.notificationKey);
              console.log('Join request rejected');
            } catch (error) {
              console.error('Error rejecting join request:', error);
            }
          }
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              await this.tripService.addPassengerToTrip(this.tripInfo?.driver.uid!, request, driverName);
              await this.updateNotificationHandledStatus(this.tripInfo?.driver.uid!, request.notificationKey);
              this.tripInfo?.passengers.push(request);
              this.cdr.detectChanges();
            } catch (error) {
              console.error('Error adding passenger to trip:', error);
            }
          }
        }
      ]
    });
  
    await alert.present();

    // setTimeout(() => {
    //   alert.dismiss();
    // }, 5000); 
  }

  async handlePassengerNotification(notification: any) {
    const alert = await this.alertController.create({
      header: 'Alerta de viaje',
      message: notification.message,
      buttons: ['OK']
    });

    await alert.present();

    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      await this.updateNotificationHandledStatus(currentUser.uid, notification.key);
    }
  }

  async updateNotificationHandledStatus(driverUid: string, notificationKey: string) {
    const notificationRef = ref(this.database, `notifications/${driverUid}/${notificationKey}`);
    await update(notificationRef, { handled: true });
  }
}