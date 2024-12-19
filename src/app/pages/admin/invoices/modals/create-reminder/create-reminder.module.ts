import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateReminderPageRoutingModule } from './create-reminder-routing.module';

import { CreateReminderPage } from './create-reminder.page';
import { IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableSearchFailTemplateDirective  } from 'ionic-selectable';
import { CapitalizeFirstLetterPipe } from 'src/app/pipes/capitalize-first-letter.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicSelectableComponent,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableItemTemplateDirective,
    IonicModule,
    CreateReminderPageRoutingModule,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [CreateReminderPage,CapitalizeFirstLetterPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateReminderPageModule {}
