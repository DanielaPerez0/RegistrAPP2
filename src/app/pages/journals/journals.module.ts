import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JournalsPageRoutingModule } from './journals-routing.module';

import { JournalsPage } from './journals.page';

import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    QRCodeModule,
    CommonModule,
    FormsModule,
    IonicModule,
    JournalsPageRoutingModule
  ],
  declarations: [JournalsPage]
})
export class JournalsPageModule {}
