import { OnInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from 'src/app/services/auth.service';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class MapComponent implements OnInit {
  @ViewChild('map') mapElementRef!: ElementRef;
  map: any;
  mapListener: any;
  currentMarker: any;
  originMarker: any;
  destinationMarker: any;
  directionsService: any;
  directionsRenderer: any;
  center: { lat: number, lng: number } = { lat: 0, lng: 0 };
  activeProfile: 'passenger' | 'driver' | null;

  constructor(private authService: AuthService) {
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
      suppressMarkers: true
    });
    this.directionsRenderer.setMap(this.map);

    if (this.activeProfile === 'driver') {
      this.setDriverMode();
    } else if (this.activeProfile === 'passenger') {
      this.setPassengerMode();
    }
  }

  setDriverMode() {
    const input = document.getElementById('pac-input') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        console.error('No details available for input: ' + place.name);
        return;
      }

      const destination = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      this.calculateAndDisplayRoute(this.center, destination);
    });
  }

  setPassengerMode() {
    // Lógica específica para el Pasajero
    // Aquí se puede implementar la lógica para mostrar la lista de viajes
  }

  addCustomMarker(position: { lat: number, lng: number }, title: string, iconUrl: string) {
    const { AdvancedMarkerElement } = google.maps.marker;

    const markerContent = document.createElement('div');
    markerContent.innerHTML = `
      <div style="background-color: white; border: 1px solid black; padding: 5px; border-radius: 50%;">
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

  calculateAndDisplayRoute(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) {
    this.directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);

        if (this.originMarker) {
          this.originMarker.map = null;
        }
        if (this.destinationMarker) {
          this.destinationMarker.map = null;
        }

        this.originMarker = this.addCustomMarker(origin, 'Origin', 'URL_DE_TU_IMAGEN_ORIGEN');
        this.destinationMarker = this.addCustomMarker(destination, 'Destination', 'URL_DE_TU_IMAGEN_DESTINO');
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }
}