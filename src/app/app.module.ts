import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, iosTransitionAnimation } from '@ionic/angular';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Interceptor } from './providers/interceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateConfigService } from './services/translate-config.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

import { FiltersPageModule as CustomersPageFiltersModule } from './pages/admin/customers/modals/filters/filters.module';
import { FiltersPageModule as InvoicesPageFiltersModule } from './pages/admin/invoices/modals/filters/filters.module';
import { FiltersPageModule as ProposalsFiltersPageModule } from './pages/admin/proposals/modals/filters/filters.module';
import { FiltersPageModule as EstimatesFiltersPageModule } from './pages/admin/estimates/modals/filters/filters.module';
import { FiltersPageModule as ExpensesFiltersPageRoutingModule } from './pages/admin/expenses/modals/filters/filters.module';
import { FiltersPageModule as ProjectsFiltersPageModule } from './pages/admin/projects/modals/filters/filters.module';
import { FiltersPageModule as LeadsFiltersPageModule } from './pages/admin/leads/modals/filters/filters.module';
import { FiltersPageModule as TasksFiltersPageModule } from './pages/admin/tasks/modals/filters/filters.module';

import { CreatePaymentPageModule } from './pages/admin/invoices/modals/create-payment/create-payment.module';
import { CreateNotePageModule } from './pages/admin/invoices/modals/create-note/create-note.module';
import { CreateReminderPageModule } from './pages/admin/invoices/modals/create-reminder/create-reminder.module';
import { CreateCommentPageModule } from './pages/admin/proposals/modals/create-comment/create-comment.module';
import { CreateCommentPageModule as TaskCreateCommentPageModule } from './pages/admin/tasks/modals/create-comment/create-comment.module';
import { CreateTimesheetPageModule } from './pages/admin/tasks/modals/create-timesheet/create-timesheet.module';
import { CreateMilestonePageModule } from './pages/admin/projects/modals/create-milestone/create-milestone.module';
import { CreateContactPageModule } from './pages/admin/customers/modals/create-contact/create-contact.module';
import { CreatePageModule as EstimateCreatePageModule } from './pages/admin/estimates/create/create.module';
import { CreatePageModule as InvoiceCreatePageModule } from './pages/admin/invoices/create/create.module';
import { CreatePageModule as CreateTodoPageModule } from './pages/admin/todos/create/create.module';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { TicketReplyPageModule } from './pages/admin/tickets/modals/ticket-reply/ticket-reply.module';
import { ApplyToInvoicePageModule } from './pages/admin/credit_notes/modals/apply-to-invoice/apply-to-invoice.module';
import { InvoiceSendToClientPageModule } from './pages/admin/invoices/modals/invoice-send-to-client/invoice-send-to-client.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgCircleProgressModule } from 'ng-circle-progress';
// import { SwiperModule } from 'swiper/angular';
import { ConvertToCustomerPageModule } from './pages/admin/leads/modals/convert-to-customer/convert-to-customer.module';
import { RefundPageModule } from './pages/admin/credit_notes/modals/refund/refund.module';
import { CreateDiscussionPageModule } from './pages/admin/projects/modals/create-discussion/create-discussion.module';

import { SortingPageModule as CustomersPageSortingModule } from './pages/admin/customers/modals/sorting/sorting.module';
import { DateTimePipe } from './pipes/date-time.pipe';
import { AttachFilePageModule } from './pages/admin/proposals/modals/attach-file/attach-file.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

export function customTransition(navEl, opts) {
  return iosTransitionAnimation(navEl, opts);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot({
      swipeBackEnabled: true,
      animated: true,
      backButtonIcon: '/assets/icon/left.svg',
      backButtonText: '',
      menuIcon: '/assets/icon/menu.svg',
      navAnimation: customTransition,
      innerHTMLTemplatesEnabled: true
    }),
    IonicStorageModule.forRoot({
      name: '__my_perfexcrm_db',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    AppRoutingModule,

    CustomersPageSortingModule,

    CustomersPageFiltersModule,
    InvoicesPageFiltersModule,
    ProposalsFiltersPageModule,
    EstimatesFiltersPageModule,
    ExpensesFiltersPageRoutingModule,
    ProjectsFiltersPageModule,
    LeadsFiltersPageModule,
    TasksFiltersPageModule,


    CreatePaymentPageModule,
    CreateNotePageModule,
    CreateReminderPageModule,
    CreateCommentPageModule,
    TaskCreateCommentPageModule,
    CreateTimesheetPageModule,
    CreateMilestonePageModule,
    CreateContactPageModule,
    CreateTodoPageModule,
    CreateDiscussionPageModule,

    ConvertToCustomerPageModule,
    EstimateCreatePageModule,
    InvoiceCreatePageModule,
    TicketReplyPageModule,
    ApplyToInvoicePageModule,
    InvoiceSendToClientPageModule,
    RefundPageModule,
    AttachFilePageModule,

    // IonicSelectableComponent ,
    EditorModule,
    NgxDropzoneModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    }),
    // SwiperModule
  ],
  providers: [
    TranslateConfigService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    { provide: TINYMCE_SCRIPT_SRC, useValue: '/assets/plugins/tinymce/tinymce.min.js' },
    DateTimePipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
