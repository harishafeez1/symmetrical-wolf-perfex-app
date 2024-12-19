import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { SortingComponent } from 'src/app/components/commons/sorting/sorting.component';
import { ListCardComponent } from 'src/app/components/tasks/list-card/list-card.component';
import { SkeletonComponent } from 'src/app/components/skeleton/skeleton.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPageRoutingModule,
    ListCardComponent,
    SharePipeModule,
    SortingComponent,
    SkeletonComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [ListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListPageModule {}
