import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapElementRef!: ElementRef;
  @Input() role: 'driver' | 'passenger' = 'driver'; // Default role is 'driver'
  @Input() destination: { lat: number, lng: number } | null = null; // Destination for passenger
  center = { lat: -34.387, lng: 150.644 };
  map: any;
  userMarker: any;
  carMarker: any;
  mapListener: any;
  markerListener: any;
  intersectionObserver: any;
  directionsService: any;
  directionsRenderer: any;

  constructor() { }

  ngAfterViewInit() {
    this.loadMap();
  }

  async loadMap() {
    console.log('Loading map...');
    const { Map } = await google.maps.importLibrary("maps");

    const mapOptions = {
      center: this.center,
      zoom: 18,
      mapId: '977b8df018511dc6',
      disableDefaultUI: true
    };

    this.map = new Map(this.mapElementRef.nativeElement, mapOptions);

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    await this.requestLocationPermissions();
  }

  async requestLocationPermissions() {
    try {
      const hasPermission = await Geolocation.requestPermissions();
      if (hasPermission.location === 'granted') {
        this.getCurrentLocation();
      } else {
        alert('Location permission not granted');
      }
    } catch (error) {
      console.error('Error requesting location permissions', error);
      alert('Error requesting location permissions');
    }
  }

  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({ timeout: 10000 });
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.map.setCenter(this.center);
      this.addMarker(this.center, 'Driver Location');
      // Call selectDestination after setting the current location
      this.selectDestination();
    } catch (error: any) {
      if (error && typeof error.code === 'number') {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            console.error('User denied the request for Geolocation.');
            alert('Please enable location services to use this feature.');
            break;
          case 2: // POSITION_UNAVAILABLE
            console.error('Location information is unavailable.');
            alert('Location information is unavailable. Please try again later.');
            break;
          case 3: // TIMEOUT
            console.error('The request to get user location timed out.');
            alert('The request to get your location timed out. Please try again.');
            break;
          default:
            console.error('An unknown error occurred.');
            alert('An unknown error occurred while trying to fetch your location.');
            break;
        }
      } else {
        console.error('An unknown error occurred.', error);
        alert('An unknown error occurred while trying to fetch your location.');
      }
    }
  }

  addMarker(position: { lat: number, lng: number }, title: string) {
    new google.maps.Marker({
      position,
      map: this.map,
      title
    });
  }

  selectDestination() {
    this.mapListener = this.map.addListener('click', (event: any) => {
      const destination = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.addMarker(destination, 'Destination');
      this.calculateAndDisplayRoute(this.center, destination);
      google.maps.event.removeListener(this.mapListener);
    });
  }

  calculateAndDisplayRoute(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) {
    this.directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    })
  }
}