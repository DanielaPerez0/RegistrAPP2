import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CamaraPageRoutingModule } from './camara-routing.module';

import { CamaraPage } from './camara.page';
import { BarcodeScanningModalComponent } from './barcode-scanning-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CamaraPageRoutingModule
  ],
  declarations: [CamaraPage,BarcodeScanningModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agregar CUSTOM_ELEMENTS_SCHEMA
})
export class CamaraPageModule {}
