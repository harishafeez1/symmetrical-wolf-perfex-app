import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreatePageRoutingModule } from './create-routing.module';

import { CreatePage } from './create.page';
import { IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableSearchFailTemplateDirective, IonicSelectableValueTemplateDirective  } from 'ionic-selectable';
import { CustomFieldsComponent } from 'src/app/components/custom-fields/custom-fields.component';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IonicSelectableComponent,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableItemTemplateDirective,
    IonicSelectableValueTemplateDirective,
    CreatePageRoutingModule,
    MpcLoaderComponent,
    CustomFieldsComponent,
    SharePipeModule,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [CreatePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreatePageModule {}