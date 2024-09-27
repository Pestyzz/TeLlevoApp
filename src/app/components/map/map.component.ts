import { AfterViewInit, Component, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NotificationService } from 'src/app/services/notification.service';
import { TripService } from 'src/app/services/trip.service';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map') mapElementRef!: ElementRef;
  center = { lat: -34.387, lng: 150.644 };
  map: any;
  userMarker: any;
  carMarker: any;
  mapListener: any;
  markerListener: any;
  intersectionObserver: any;
  private renderer = inject(Renderer2);
  private alertController = inject(AlertController);
  private notificationService = inject(NotificationService);
  private tripService = inject(TripService);

  constructor() { }

  ngAfterViewInit() {
    this.loadMap();
  }

  async loadMap() {
    console.log('Loading map...');
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const mapEl = this.mapElementRef.nativeElement;
    console.log('Map element:', mapEl);

    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('User location:', userLocation);

          // Actualizar el centro del mapa con la ubicación del usuario
          this.center = userLocation;

          const location = new google.maps.LatLng(this.center.lat, this.center.lng);
          console.log('Location:', location);

          this.map = new Map(mapEl, {
            center: location,
            zoom: 14,
            mapId: "977b8df018511dc6",
            disableDefaultUI: true,
          });

          // Agregar un marcador en la ubicación del usuario (marcador normal)
          this.userMarker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: 'You are here'
          });

          // Crear un elemento HTML para el ícono del auto
          const carIcon = document.createElement('div');
          carIcon.innerHTML = '<img src="assets/car.png" style="width: 50px; height: 50px;">';

          // Calcular la posición del auto cerca de la ubicación del usuario
          const carLocation = new google.maps.LatLng(this.center.lat + 0.001, this.center.lng + 0.001);

          // Agregar un marcador en la ubicación cercana con un ícono de auto
          this.carMarker = new AdvancedMarkerElement({
            position: carLocation,
            map: this.map,
            title: 'Car',
            content: carIcon // Usar el elemento HTML como contenido del marcador
          });

          // Agregar un evento de clic al marcador del auto
          this.carMarker.addListener('click', () => {
            this.presentAlert();
          });

          console.log('Map initialized:', this.map);

          this.renderer.addClass(mapEl, 'visible');
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Si hay un error al obtener la ubicación del usuario, inicializar el mapa con el centro predeterminado
          this.initializeMap(mapEl, AdvancedMarkerElement);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      alert('Geolocation is not supported by this browser.');
      // Si la geolocalización no es compatible, inicializar el mapa con el centro predeterminado
      this.initializeMap(mapEl, AdvancedMarkerElement);
    }
  }

  initializeMap(mapEl: HTMLElement, AdvancedMarkerElement: any) {
    const location = new google.maps.LatLng(this.center.lat, this.center.lng);
    console.log('Default location:', location);

    this.map = new google.maps.Map(mapEl, {
      center: location,
      zoom: 14,
      mapId: "977b8df018511dc6",
      disableDefaultUI: true, // Desactivar todos los controles predeterminados
    });

    // Agregar un marcador en la ubicación predeterminada (marcador normal)
    this.userMarker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'Default location'
    });

    console.log('Map initialized with default location:', this.map);

    this.renderer.addClass(mapEl, 'visible');
  }

  async presentAlert() {
    if (this.tripService.isTripRequested()) {
      // Mostrar alerta si el viaje ya ha sido solicitado
      const alert = await this.alertController.create({
        header: 'Información del Conductor',
        subHeader: 'Ya te encuentras en un viaje.',
        buttons: ['Aceptar']
      });
      await alert.present();
    } else {
      // Mostrar alerta con opción de solicitar viaje
      const alert = await this.alertController.create({
        header: 'Información del Conductor',
        subHeader: 'Detalles del vehículo',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Solicitar Viaje',
            handler: () => {
              console.log('Solicitar Viaje clicked');
              this.notificationService.addNotification('Solicitud de viaje aceptada');
              this.notificationService.addHistory('Viaje solicitado', 'Viaje en proceso.');
              this.tripService.setTripRequested(true); // Marcar que el viaje ha sido solicitado
            }
          }
        ]
      });

      // Presentar la alerta primero
      await alert.present();

      // Asignar el contenido HTML usando innerHTML después de que la alerta se haya presentado
      const alertMessageElement = document.querySelector('ion-alert .alert-message');
      if (alertMessageElement) {
        alertMessageElement.innerHTML = `
          <p><strong>Nombre del Conductor:</strong> Juan Pérez</p>
          <p><strong>Patente:</strong> ABC123</p>
          <p><strong>Modelo del Auto:</strong> Toyota Corolla</p>
          <p><strong>Capacidad:</strong> 4 asientos</p>
          <p><strong>Asientos Disponibles:</strong> 4 asientos</p>
        `;
      }
    }
  }
}