import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsPageRoutingModule } from './notifications-routing.module';

import { NotificationsPage } from './notifications.page';
import { SkeletonComponent } from 'src/app/components/skeleton/skeleton.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    SkeletonComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [NotificationsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotificationsPageModule {}
