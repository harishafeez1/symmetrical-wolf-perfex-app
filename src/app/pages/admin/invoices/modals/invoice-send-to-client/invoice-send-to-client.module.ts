import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoiceSendToClientPageRoutingModule } from './invoice-send-to-client-routing.module';

import { InvoiceSendToClientPage } from './invoice-send-to-client.page';
import { IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableSearchFailTemplateDirective  } from 'ionic-selectable';
import { EditorModule } from '@tinymce/tinymce-angular';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorModule,
    IonicSelectableComponent,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableItemTemplateDirective,
    IonicModule,
    InvoiceSendToClientPageRoutingModule,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [InvoiceSendToClientPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InvoiceSendToClientPageModule {}
