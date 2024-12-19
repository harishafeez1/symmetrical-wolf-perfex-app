import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { SortingComponent } from 'src/app/components/commons/sorting/sorting.component';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { SkeletonComponent } from 'src/app/components/skeleton/skeleton.component';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ListPageRoutingModule,
    SortingComponent,
    SharePipeModule,
    SkeletonComponent,
    MpcLoaderComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [ListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListPageModule {}
