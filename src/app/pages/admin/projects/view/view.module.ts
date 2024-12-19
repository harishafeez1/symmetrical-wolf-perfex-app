import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewPageRoutingModule } from './view-routing.module';

import { ViewPage } from './view.page';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { IonicSelectableComponent, IonicSelectableFooterTemplateDirective, IonicSelectableHeaderTemplateDirective, IonicSelectableItemIconTemplateDirective, IonicSelectableItemTemplateDirective, IonicSelectableSearchFailTemplateDirective  } from 'ionic-selectable';
import { ListCardComponent } from 'src/app/components/subscriptions/list-card/list-card.component';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { ListCardComponent as TaskListCardComponent } from 'src/app/components/tasks/list-card/list-card.component';
import { ListCardComponent as NoteListCardComponent } from 'src/app/components/notes/list-card/list-card.component';
import { ListCardComponent as InvoiceListCardComponent } from 'src/app/components/invoices/list-card/list-card.component';
import { ListCardComponent as EstimateListCardComponent } from 'src/app/components/estimate/list-card/list-card.component';
import { ListCardComponent as CreditNoteListCardComponent } from 'src/app/components/credit-note/list-card/list-card.component';
import { ListCardComponent as ExpenseListCardComponent } from 'src/app/components/expense/list-card/list-card.component';
import { ListCardComponent as TicketListCardComponent } from 'src/app/components/tickets/list-card/list-card.component';
import { ListCardComponent as ProposalListCardComponent } from 'src/app/components/proposal/list-card/list-card.component';
import { SortingComponent } from 'src/app/components/commons/sorting/sorting.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { EditorModule } from '@tinymce/tinymce-angular';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDropzoneModule,
    IonicSelectableComponent,
    IonicSelectableHeaderTemplateDirective,
    IonicSelectableSearchFailTemplateDirective,
    IonicSelectableItemIconTemplateDirective,
    IonicSelectableFooterTemplateDirective,
    IonicSelectableItemTemplateDirective,
    MpcLoaderComponent,
    ListCardComponent,
    ViewPageRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    SharePipeModule,
    TaskListCardComponent,
    NoteListCardComponent,
    InvoiceListCardComponent,
    EstimateListCardComponent,
    CreditNoteListCardComponent,
    ExpenseListCardComponent,
    TicketListCardComponent,
    SortingComponent,
    NgCircleProgressModule,
    ReactiveFormsModule,
    EditorModule,
    ProposalListCardComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [ViewPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewPageModule {}
