import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppSubscriptionPageRoutingModule } from './app-subscription-routing.module';

import { AppSubscriptionPage } from './app-subscription.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppSubscriptionPageRoutingModule,
    TranslateModule
  ],
  declarations: [AppSubscriptionPage]
})
export class AppSubscriptionPageModule {}
