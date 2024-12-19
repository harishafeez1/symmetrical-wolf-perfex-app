import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewPageRoutingModule } from './view-routing.module';

import { ViewPage } from './view.page';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { ListCardComponent as TaskListCardComponent } from 'src/app/components/tasks/list-card/list-card.component';
import { ListCardComponent as NoteListCardComponent } from 'src/app/components/notes/list-card/list-card.component';
import { ListCardComponent as ProposalListCardComponent } from 'src/app/components/proposal/list-card/list-card.component';
import { ListCardComponent as ReminderListCardComponent } from 'src/app/components/reminders/list-card/list-card.component';
import { ListCardComponent as ActivityListCardComponent } from 'src/app/components/activity-log/list-card/list-card.component';
import { SortingComponent } from 'src/app/components/commons/sorting/sorting.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDropzoneModule,
    MpcLoaderComponent,
    ViewPageRoutingModule,
    SharePipeModule,
    TaskListCardComponent,
    NoteListCardComponent,
    ProposalListCardComponent,
    ReminderListCardComponent,
    ActivityListCardComponent,
    SortingComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [ViewPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewPageModule {}
