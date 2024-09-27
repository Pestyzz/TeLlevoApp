import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TripService } from 'src/app/services/trip.service';
import { NotificationService } from 'src/app/services/notification.service';
import { IonList, IonItem, IonIcon, IonLabel } from "@ionic/angular/standalone";

@Component({
  selector: 'app-nearby-vehicles',
  templateUrl: './nearby-vehicles.component.html',
  styleUrls: ['./nearby-vehicles.component.scss'],
  standalone: true,
  imports: [IonLabel, IonIcon, IonItem, IonList, ]
})
export class NearbyVehiclesComponent {
  constructor(
    private alertController: AlertController,
    private tripService: TripService,
    private notificationService: NotificationService
  ) {}

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