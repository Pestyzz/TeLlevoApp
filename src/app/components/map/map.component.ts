import { OnInit, Component, ElementRef, ViewChild, ViewEncapsulation, 
  ChangeDetectorRef } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Database, ref, set, update } from '@angular/fire/database';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TripInterface } from 'src/app/interfaces/trip.interface';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput, IonButton, 
  IonList, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { locationOutline, golfOutline, navigateOutline, timeOutline, cashOutline, arrowDownOutline, arrowUpOutline, closeOutline } from 'ionicons/icons';
import { PriceFormatPipe } from 'src/app/pipes/price-format.pipe';
import { TripService } from 'src/app/services/trip.service';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonIcon, IonList, IonButton, IonInput, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonCard, 
    PriceFormatPipe]
})
export class MapComponent implements OnInit {
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

  constructor(private authService: AuthService, private database: Database, private router: Router, 
    private alertController: AlertController, private cdr: ChangeDetectorRef, private tripService: TripService) {
      addIcons({locationOutline,golfOutline,navigateOutline,timeOutline,cashOutline,closeOutline,arrowUpOutline});
      this.activeProfile = this.authService.getActiveProfile();
  }

  ngOnInit() {
    this.loadMap();
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
      this.setPassengerMode();
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
          this.tripInfo = {
            driver: this.authService.currentUserSig(),
            vehicle: this.authService.vehicleSig(),
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
            localStorage.setItem('currentTrip', JSON.stringify(this.tripInfo));
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
    localStorage.setItem('currentTrip', JSON.stringify(this.tripInfo));
    this.tripStarted = true;
    this.tripService.startTrip();
    this.router.navigate(['/main/map']);
  }

  completeTrip() {
    if (this.tripInfo) {
      this.tripInfo.status = 'completed';
    }
    const tripRef = ref(this.database, `trip/${this.authService.firebaseAuth.currentUser?.uid}`);
    update(tripRef, { status: 'completed' });
    localStorage.removeItem('currentTrip');
    this.tripStarted = false;
    this.tripService.completeTrip();
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
      this.completeTrip();
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

  setPassengerMode() {
    // Lógica específica para el Pasajero
    // Aquí se puede implementar la lógica para mostrar la lista de viajes
  }

  addPassengerToTrip(passenger: any, driver: any) {
    if (!this.tripInfo) {
      console.error('Trip information is missing');
      return;
    }

    if (this.tripInfo.passengers.length >= this.tripInfo.vehicle.capacity) {
      console.error('Vehicle is full');
      return;
    }

    this.tripInfo.passengers.push(passenger);
    const tripRef = ref(this.database, `trip/${driver.uid}`);
    update(tripRef, { passengers: this.tripInfo.passengers });

    this.cdr.detectChanges();
  }
}
