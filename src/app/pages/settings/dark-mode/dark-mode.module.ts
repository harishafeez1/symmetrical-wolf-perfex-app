import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DarkModePageRoutingModule } from './dark-mode-routing.module';

import { DarkModePage } from './dark-mode.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DarkModePageRoutingModule,
    TranslateModule
  ],
  declarations: [DarkModePage]
})
export class DarkModePageModule {}
