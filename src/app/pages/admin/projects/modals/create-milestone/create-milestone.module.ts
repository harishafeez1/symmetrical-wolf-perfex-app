import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateMilestonePageRoutingModule } from './create-milestone-routing.module';

import { CreateMilestonePage } from './create-milestone.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateMilestonePageRoutingModule,
    TranslateModule
  ],
  declarations: [CreateMilestonePage]
})
export class CreateMilestonePageModule {}
