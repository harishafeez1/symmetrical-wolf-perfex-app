import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewPageRoutingModule } from './view-routing.module';

import { ViewPage } from './view.page';
import { MpcLoaderComponent } from 'src/app/components/mpc-loader/mpc-loader.component';
import { SharePipeModule } from 'src/app/pipes/share-pipe.module';
import { ListCardComponent as TaskListCardComponent } from 'src/app/components/tasks/list-card/list-card.component';
import { ListCardComponent as NoteListCardComponent } from 'src/app/components/notes/list-card/list-card.component';
import { ListCardComponent as InvoiceListCardComponent } from 'src/app/components/invoices/list-card/list-card.component';
import { ListCardComponent as PaymentListCardComponent } from 'src/app/components/payments/list-card/list-card.component';
import { ListCardComponent as ProposalListCardComponent } from 'src/app/components/proposal/list-card/list-card.component';
import { ListCardComponent as EstimateListCardComponent } from 'src/app/components/estimate/list-card/list-card.component';
import { ListCardComponent as ProjectListCardComponent} from 'src/app/components/project/list-card/list-card.component';
import { ListCardComponent as CreditNoteListCardComponent } from 'src/app/components/credit-note/list-card/list-card.component';
import { ListCardComponent as TicketListCardComponent } from 'src/app/components/tickets/list-card/list-card.component';
import { SortingComponent } from 'src/app/components/commons/sorting/sorting.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyComponent } from 'src/app/components/empty/empty.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MpcLoaderComponent,
    ViewPageRoutingModule,
    TaskListCardComponent,
    SharePipeModule,
    NoteListCardComponent,
    InvoiceListCardComponent,
    PaymentListCardComponent,
    ProposalListCardComponent,
    EstimateListCardComponent,
    ProjectListCardComponent,
    CreditNoteListCardComponent,
    TicketListCardComponent,
    SortingComponent,
    TranslateModule,
    EmptyComponent
  ],
  declarations: [ViewPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewPageModule {}
