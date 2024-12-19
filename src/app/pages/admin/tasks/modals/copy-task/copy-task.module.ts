import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CopyTaskPageRoutingModule } from './copy-task-routing.module';

import { CopyTaskPage } from './copy-task.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CopyTaskPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [CopyTaskPage]
})
export class CopyTaskPageModule {}
