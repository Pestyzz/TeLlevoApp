import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-close-vehicles',
  templateUrl: './close-vehicles.page.html',
  styleUrls: ['./close-vehicles.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CloseVehiclesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
