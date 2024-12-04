import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisAsignaturasPageRoutingModule } from './mis-asignaturas-routing.module';

import { MisAsignaturasPage } from './mis-asignaturas.page';

import { QRCodeModule } from 'angularx-qrcode';
import { AppComponent } from '../app.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisAsignaturasPageRoutingModule,
    QRCodeModule
  ],
  declarations: [MisAsignaturasPage],
  providers: [],
  bootstrap: [AppComponent]
})
export class MisAsignaturasPageModule {}
