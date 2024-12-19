import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateNotePageRoutingModule } from './create-note-routing.module';

import { CreateNotePage } from './create-note.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateNotePageRoutingModule,
    TranslateModule
  ],
  declarations: [CreateNotePage]
})
export class CreateNotePageModule {}
