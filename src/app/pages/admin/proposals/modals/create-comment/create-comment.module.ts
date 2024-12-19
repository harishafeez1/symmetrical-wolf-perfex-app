import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCommentPageRoutingModule } from './create-comment-routing.module';

import { CreateCommentPage } from './create-comment.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateCommentPageRoutingModule,
    TranslateModule
  ],
  declarations: [CreateCommentPage]
})
export class CreateCommentPageModule {}
