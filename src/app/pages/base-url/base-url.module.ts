import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BaseUrlPageRoutingModule } from './base-url-routing.module';

import { BaseUrlPage } from './base-url.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    BaseUrlPageRoutingModule,
    TranslateModule
  ],
  declarations: [BaseUrlPage],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BaseUrlPageModule {}
