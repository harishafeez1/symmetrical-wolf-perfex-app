import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateTemplatePageRoutingModule } from './create-template-routing.module';

import { CreateTemplatePage } from './create-template.page';
import { EditorModule } from '@tinymce/tinymce-angular';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateTemplatePageRoutingModule,
    EditorModule,
    TranslateModule
  ],
  declarations: [CreateTemplatePage]
})
export class CreateTemplatePageModule {}
