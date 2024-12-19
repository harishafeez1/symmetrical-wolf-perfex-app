import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateDiscussionPageRoutingModule } from './create-discussion-routing.module';

import { CreateDiscussionPage } from './create-discussion.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CreateDiscussionPageRoutingModule,
    TranslateModule
  ],
  declarations: [CreateDiscussionPage]
})
export class CreateDiscussionPageModule {}
