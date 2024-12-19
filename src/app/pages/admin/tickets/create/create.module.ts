import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreatePageRoutingModule } from './create-routing.module';

import { CreatePage } from './create.page';
import { IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableSearchFailTemplateDirective  } from 'ionic-selectable';
import { EditorModule } from '@tinymce/tinymce-angular';
import { CustomFieldsComponent } from 'src/app/components/custom-fields/custom-fields.component';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EditorModule,
    IonicModule,
    NgxDropzoneModule,
    ReactiveFormsModule,
    IonicSelectableComponent,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableItemTemplateDirective,
    CreatePageRoutingModule,
    MpcLoaderComponent,
    CustomFieldsComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [CreatePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreatePageModule {}
