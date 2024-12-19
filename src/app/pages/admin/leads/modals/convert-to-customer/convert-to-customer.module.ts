import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConvertToCustomerPageRoutingModule } from './convert-to-customer-routing.module';

import { ConvertToCustomerPage } from './convert-to-customer.page';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { CustomFieldsComponent } from 'src/app/components/custom-fields/custom-fields.component';
import { IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableSearchFailTemplateDirective  } from 'ionic-selectable';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ConvertToCustomerPageRoutingModule,
    MpcLoaderComponent,
    IonicSelectableComponent,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableItemTemplateDirective,
    CustomFieldsComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [ConvertToCustomerPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConvertToCustomerPageModule {}
