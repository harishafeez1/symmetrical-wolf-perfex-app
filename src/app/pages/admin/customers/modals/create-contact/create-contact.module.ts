import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateContactPageRoutingModule } from './create-contact-routing.module';

import { CreateContactPage } from './create-contact.page';
import { CustomFieldsComponent } from 'src/app/components/custom-fields/custom-fields.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateContactPageRoutingModule,
    CustomFieldsComponent,
    NgxDropzoneModule,
    TranslateModule
  ],
  declarations: [CreateContactPage]
})
export class CreateContactPageModule {}
