import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderAppPageRoutingModule } from './order-app-routing.module';

import { OrderAppPage } from './order-app.page';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderAppPageRoutingModule,
    ReactiveFormsModule,
    MpcLoaderComponent,
    TranslateModule
  ],
  declarations: [OrderAppPage]
})
export class OrderAppPageModule {}
