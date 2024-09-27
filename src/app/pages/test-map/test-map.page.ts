import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { MapComponent } from "../../components/map/map.component";

@Component({
  selector: 'app-test-map',
  templateUrl: './test-map.page.html',
  styleUrls: ['./test-map.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, MapComponent]
})
export class TestMapPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
