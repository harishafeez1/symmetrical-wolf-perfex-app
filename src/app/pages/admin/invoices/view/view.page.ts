import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetButton, ActionSheetController, IonRefresher, IonRouterOutlet, ModalController, Platform, ToastController } from '@ionic/angular';
import { InvoicesHelper, STATUS_CANCELLED, STATUS_DRAFT, STATUS_OVERDUE, STATUS_PAID, STATUS_PARTIALLY, STATUS_UNPAID } from 'src/app/classes/invoices-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { PaymentApiService } from 'src/app/services/payment-api.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { FiltersPage } from '../../tasks/modals/filters/filters.page';
import { CreateNotePage } from '../modals/create-note/create-note.page';
import { CreatePaymentPage } from '../modals/create-payment/create-payment.page';
import { CreateReminderPage } from '../modals/create-reminder/create-reminder.page';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Browser } from '@capacitor/browser';
import { InvoiceSendToClientPage } from '../modals/invoice-send-to-client/invoice-send-to-client.page';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdatePaymentPage } from '../../payments/create/create.page';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateInvoicePage } from 'src/app/pages/admin/invoices/create/create.page';
import { Subscription } from 'rxjs';
import { addDays, addMonths, addWeeks, addYears, formatDistance } from 'date-fns';
import { AttachFilePage } from '../../proposals/modals/attach-file/attach-file.page';
import { AttachFileApiService } from 'src/app/services/attach-file-api.service';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { CommonHelper } from 'src/app/classes/common-helper';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { MiscApiService } from 'src/app/services/misc-api.service';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  @Input() invoiceId: any;
  @Input() type = '';
  @Input() invoiceInfo: any;
  invoice_id = this.activatedRoute.snapshot.paramMap.get('id');

  isLoading = true;
  isSearching = false;

  STATUS_CANCELLED = STATUS_CANCELLED;
  STATUS_UNPAID = STATUS_UNPAID;
  STATUS_PAID = STATUS_PAID;
  STATUS_PARTIALLY = STATUS_PARTIALLY;
  STATUS_OVERDUE = STATUS_OVERDUE;
  STATUS_DRAFT = STATUS_DRAFT;

  selectedTab = 'invoice';

  invoice: any;

  currencies = [];
  totalTaxes = [];

  payments = [];
  payment_search = '';

  activities = [];
  notes = [];

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    // invoice_id: this.invoice_id,
    rel_type: 'invoice',
    rel_id: this.invoice_id,
    status: [],
    assigned: []
  };

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;
  private currency$: Subscription;
  dayDuration: any;
  nextInvoiceDate: any;

  credit_notes = [];
  credit_note_search = '';
  credit_note_offset = 0;
  credit_note_limit = 20;
  creditNoteAppliedFilters = {
    invoice_id: this.invoice_id
  };

  invoices = [];
  invoice_search = '';
  invoice_offset = 0;
  invoice_limit = 20;
  invoiceAppliedFilters = {
    invoice_id: this.invoice_id
  };
  constructor(
    private platform: Platform,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private invoiceApi: InvoiceApiService,
    private currencyApi: CurrencyApiService,
    public invoiceHelper: InvoicesHelper,
    public commonHelper: CommonHelper,
    public paymentApi: PaymentApiService,
    public taskApi: TaskApiService,
    private noteApi: NoteApiService,
    private reminderApi: ReminderApiService,
    public authService: AuthenticationService,
    public taskHelper: TasksHelper,
    public modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private actionSheetController: ActionSheetController,
    private attachFileApi: AttachFileApiService,
    private miscApi: MiscApiService,
    private downloadApi: DownloadApiService,
    private mpcAlert: MpcAlertService,
    private creditNoteApi: CreditNoteApiService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {

  }

  ngOnInit() {
    this.invoice_id = this.invoice_id ?? this.invoiceId;
    console.log('this.invoice_id =>', this.invoice_id);
    this.taskAppliedFilters.rel_id = this.invoice_id;
    this.creditNoteAppliedFilters.invoice_id = this.invoice_id;
    this.invoiceAppliedFilters.invoice_id = this.invoice_id;
    // window.addEventListener("admin:invoice_updated", () => {
    //   this.getInvoice();
    // });
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.invoice = this.router.getCurrentNavigation().extras.state;
        this.calculateInvoice();
        this.getDateDuration(this.invoice.duedate);
        this.getNextInvoiceDate(this.invoice);
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.invoiceInfo) {
          this.invoice = this.invoiceInfo;
          this.calculateInvoice();
          this.getDateDuration(this.invoice.duedate);
          this.getNextInvoiceDate(this.invoice);
          this.isLoading = false;
        } else {
          this.getInvoice();
        }
      }
      this.getPayments(false, false, false);
      this.getActivity();
    });
    this.currency$ = this.currencyApi.getCurrenciesData().subscribe(res => {
      if (!res) {
        this.currencyApi.get().subscribe({
          next: response => {
            this.currencyApi.setCurrenciesData(response);
          }
        });
      } else {
        this.currencies = res;
      }
    })
  }

  ngOnDestroy(): void {
    this.currency$.unsubscribe();
  }

  getInvoice(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.invoiceApi.get(this.invoice_id).subscribe({
      next: (res) => {
        console.log(res);
        this.invoice = res;
        this.calculateInvoice();
        this.getDateDuration(this.invoice.duedate);
        this.getNextInvoiceDate(this.invoice);
  
        this.sharedService.dispatchEvent({
          event: 'admin:get_invoice',
          data: this.invoice
        });
  
        if (event && refresh == false) {
          event.target.disabled = true;
        }
  
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getPayments(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.paymentApi.get('', this.payment_search, null, null, {
      invoice_id: this.invoice_id
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.payments.push(...res);
          this.payments = [...new Map(this.payments.map(item => [item?.id, item])).values()];
        }
  
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getTasks(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskApi.get('', this.task_search, this.task_offset, this.task_limit, this.taskAppliedFilters).subscribe({
      next: (res: any) => {

        if (res.status !== false) {
          this.tasks.push(...res);
          this.tasks = [...new Map(this.tasks.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.task_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
        console.log('this.isLoading  =>', this.isLoading);
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.invoice_id, 'invoice', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.reminders.push(...res);
          this.reminders = [...new Map(this.reminders.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.task_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getActivity() {
    this.invoiceApi.getInvoiceActivity(this.invoice_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.activities = res;
        }
      }
    });
  }

  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('invoice', this.invoice_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.notes = res;
        }
        if (event && res.length !== this.task_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getCreditNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.creditNoteApi.get('', this.credit_note_search, this.credit_note_offset, this.credit_note_limit, this.creditNoteAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.credit_notes.push(...res);
          this.credit_notes = [...new Map(this.credit_notes.map(item => [item?.credit_note_id, item])).values()];
        }
  
        if (event && res.length !== this.credit_note_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }
  getInvoices(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.invoiceApi.get('', this.invoice_search, this.invoice_offset, this.invoice_limit, this.invoiceAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.invoices.push(...res);
          this.invoices = [...new Map(this.invoices.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.invoice_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  searchTasks(event) {
    console.log('event', event.detail.value);
    this.task_search = event.detail.value;
    this.task_offset = 0;
    this.tasks = [];
    this.getTasks(true, false, true);
  }

  searchReminders(event) {
    console.log('event', event.detail.value);
    this.reminder_search = event.detail.value;
    this.reminder_offset = 0;
    this.reminders = [];
    this.getReminders(true, false, true);
  }

  searchPayments(event) {
    console.log('event', event.detail.value);
    this.payment_search = event.detail.value;
    this.payments = [];
    this.getPayments(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.task_search = '';
    this.task_offset = 0;
    this.getTasks(true, false, false);
  }

  loadMoreTasks(event) {
    this.task_offset += this.task_limit;
    console.log('offset:', this.task_offset);
    this.getTasks(false, event, false);
  }

  loadMoreReminders(event) {
    this.reminder_offset += this.reminder_limit;
    console.log('offset:', this.reminder_offset);
    this.getReminders(false, event, false);
  }
  loadMore(event: any, tab = '') {
    this[tab + '_offset'] += this[tab + '_limit'];
    console.log(tab + '_offset:', this[tab + '_offset']);
    this['get' + this.capitalizeFirstLetter(tab) + 's'](false, event, false);
  }

  viewTask(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tasks/view', id], extras);
  }

  viewPayment(id: any, payment: any) {
    const extras: NavigationExtras = {
      state: payment
    };
    this.router.navigate(['admin/payments/view', id], extras);
  }

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  getCurrencyNameById(currency_id: Number) {
    for (let currency of this.currencies) {
      if (currency.id == currency_id) {
        return currency.name + ' <small>' + currency.symbol + '</small>';
      }
    }
    return 'System Default';
  }

  onSortingChange(sort: any, tab = '') {
    if (sort) {
      this[tab + '_offset'] = 0;
      this[tab + 's'] = [];
      this['get' + this.capitalizeFirstLetter(tab) + 's'](true);
    }
  }

  doRefresh(event: any, tab = '') {
    console.log()
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  doInvoiceRefresh(event: any, tab = '') {
    this.getInvoice(true, event);
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  calculateInvoice() {
    this.totalTaxes = [];
    this.invoice.items.forEach((item) => {
      if (item.taxrate.length != 0) {
        for (let tax of item.taxrate) {
          if (!this.totalTaxes[tax.name]) {
            this.totalTaxes[tax.name] = {
              name: tax.name
            };
          }

          this.totalTaxes[tax.name].taxrate = tax.taxrate;

          if (!this.totalTaxes[tax.name].subTotal) {
            this.totalTaxes[tax.name].subTotal = 0;
          }
          this.totalTaxes[tax.name].subTotal += (((item.rate * item.qty) / 100) * tax.taxrate);
        }

      }
    });
  }

  showDiscount(invoice) {
    if (invoice?.discount_percent) {
      return invoice.discount_percent != 0 ? '(' + parseInt(invoice.discount_percent) + '%)' : '';
    }
    return '';
  }

  async openFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: FiltersPage,
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.taskAppliedFilters = modalFilters.data;

        /* if (this.taskAppliedFilters.status.length !== 0 || this.taskAppliedFilters.sale_agent !== null) {
          this.isFiltered = true;
        } */
        if (this.taskAppliedFilters.status.length !== 0 || this.taskAppliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.task_offset = 0;
        this.tasks = [];
        this.getTasks(true);
      }
    });
    return await modal.present();
  }

  async invoiceSendToClient() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: InvoiceSendToClientPage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        invoice: this.invoice
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getInvoice();
      }
    });
    return await modal.present();
  }

  async createPayment() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreatePaymentPage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        invoice: this.invoice
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getInvoice();
        this.getPayments();
      }
    });
    return await modal.present();
  }

  async addEditNote(note: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateNotePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        rel_id: this.invoice.id,
        rel_type: 'invoice',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getInvoice();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
    console.log('this.tasks =>', this.tasks);
    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes();
    }
    /* if (event.detail.value == 'applied_credit_notes' && this.credit_notes.length == 0) {
      this.getCreditNotes(true);
    } */
   /*  if (event.detail.value == 'child_invoice' && this.invoices.length == 0) {
      this.getInvoices(true);
    } */

  }

  async addTask() {
    // const extras: NavigationExtras = {
    //   state: {
    //     rel_type: 'invoice',
    //     rel_name: this.invoice.number,
    //     relational_values: {
    //       addedfrom: "1",
    //       id: this.invoice.id,
    //       name: this.invoice.invoice_number,
    //       subtext: '',
    //       type: 'invoice'
    //     },
    //     rel_id: this.invoice_id
    //   }
    // };
    // this.router.navigate(['admin/tasks/create'], extras);
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'invoice',
          rel_name: this.invoice.number,
          relational_values: {
            addedfrom: "1",
            id: this.invoice.id,
            name: this.invoice.invoice_number,
            subtext: '',
            type: 'invoice'
          },
          rel_id: this.invoice_id
        },
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
    });
    return await modal.present();
  }

  async addEditReminder(reminder: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateReminderPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
      initialBreakpoint: 1.0,
      mode: 'ios',
      componentProps: {
        rel_type: 'invoice',
        rel_id: this.invoice_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getInvoice();
        this.getReminders();
      }
    });
    return await modal.present();
  }

  deleteActivity(id: any, index: any) {
    this.invoiceApi.deleteInvoiceActivity(id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.activities.splice(index, 1); //remove from list
        }
      }
    });
  }

  deleteTask(id: any, index: any) {
    this.taskApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.tasks.splice(index, 1); //remove from list
        }
      }
    });
  }

  deleteReminder(id: any, index: any) {
    this.reminderApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.reminders.splice(index, 1); //remove from list
        }
      }
    });
  }

  deleteNote(id: any, index: any) {
    this.noteApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.notes.splice(index, 1); //remove from list
        }
      }
    });
  }

  getPDF(action = 'view') {
    this.invoiceApi.getPDF(this.invoice_id).subscribe({
      next: async (response: any) => {
        console.log(response);
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'invoice_' + this.invoice_id + '.pdf',
            data: response.pdf,
            directory: Directory.Documents
          });
  
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/pdf',
            openWithDefault: action == 'view' ? false : true
          });
        }
      }
    });
  }

  viewInvoiceAsCustomer() {
    console.log(this.authService.BASE_URL);
    Browser.open({
      url: this.authService.BASE_URL + '/invoice/' + this.invoice_id + '/' + this.invoice.hash
    });
  }

  markAs(status) {
    this.invoiceApi.markAs(status, this.invoice_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getInvoice();
        }
      }
    });
  }

  unMarkAs(status) {
    this.invoiceApi.unmarkAs(status, this.invoice_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getInvoice();
        }
      }
    });
  }

  copyInvoice() {
    this.invoiceApi.copy(this.invoice_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_updated'));
          this.router.navigate(['/admin/invoices/edit/' + response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  createCreditNotes() {
    this.invoiceApi.createCreditNote(this.invoice_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:credit_note_created'));
          this.goToPage('/admin/credit_notes/edit/' + response.insert_id)
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  async openPdf() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('view_pdf'),
      handler: () => {
        this.getPDF();
      }
    },
      {
        text: this.translate.instant('download_pdf'),
        handler: () => {
          this.getPDF('download');
        }
      }),

      _buttons.push({
        text: this.translate.instant('cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  async openConvertTo() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('credit_notes'),
      handler: () => {
        this.createCreditNotes();
      }
    }),

      _buttons.push({
        text: this.translate.instant('cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  async openMore() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('view_invoice_as_customer_tooltip'),
      handler: () => {
        this.viewInvoiceAsCustomer();
      }
    },
      {
        text: this.translate.instant('invoice_attach_file'),
        handler: () => {
          this.attachFiles();
        }
      },
      {
        text: this.translate.instant('invoice_copy'),
        handler: () => {
          this.copyInvoice();
        }
      });

    if (this.invoice?.sent == 0) {
      _buttons.push({
        text: this.translate.instant('invoice_mark_as_sent'),
        handler: () => {
          this.markAs('sent');
        }
      });
    }

    if ((this.authService.hasPermission('invoices', 'edit') || this.authService.hasPermission('invoices', 'create')) && this.invoice?.status != STATUS_CANCELLED && this.invoice?.status != STATUS_PAID && this.invoice?.status != STATUS_PARTIALLY) {
      _buttons.push({
        text: this.translate.instant('mark_as_cancelled'),
        handler: () => {
          this.markAs('cancelled');
        }
      });
    }

    if ((this.authService.hasPermission('invoices', 'edit') || this.authService.hasPermission('invoices', 'create')) && this.invoice?.status == STATUS_CANCELLED) {
      _buttons.push({
        text: this.translate.instant('unmark_as_cancelled'),
        handler: () => { this.unMarkAs('cancelled'); }
      });
    }

    _buttons.push({
      text: this.translate.instant('cancel'),
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  close() {
    this.modalCtrl.dismiss(false, 'dismiss')
  }

  async updateTask(taskId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateTaskPage,
      mode: 'ios',
      componentProps: {
        taskId: taskId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
    });
    return await modal.present();
  }

  async updatePayment(paymentId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdatePaymentPage,
      mode: 'ios',
      componentProps: {
        paymentId: paymentId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
    });
    return await modal.present();
  }

  goToPage(page) {
    if (this.type == 'modal') {
      this.close();
    }
    this.router.navigate([`${page}`]);
  }

  notesRefresh(event) {
    if (event) {
      this.getNotes();
    }
  }

  reminderRefresh(event) {
    if (event) {
      this.getReminders();
    }
  }

  async editInvoice(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateInvoicePage,
        showBackdrop: false,
        mode: 'ios',
        componentProps: {
          invoiceId: id,
          type: 'modal'
        }
      });

      modal.onDidDismiss().then((modalFilters) => {
        console.log('modal =>', modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['/admin/invoices/edit/', id])
    }
  }

  getDateDuration(date) {
    this.dayDuration = date ? (formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      includeSeconds: false
    })).replace('about ', '') : '';
  }

  getNextInvoiceDate(invoice: any) {
    if (!invoice || invoice.recurring === '0') {
      return;
    }
    const date = invoice.recurring === 'custom' ? this.getCustomRecurring(invoice.repeat_every_custom, invoice.repeat_type_custom, invoice.date) :
      addMonths(new Date(invoice.date), Number(invoice.recurring));
    this.nextInvoiceDate = date ?? '';
  }

  getCustomRecurring(repeat_type_custom, repeat_every_custom, date) {
    const invoiceDate = new Date(date);
    let nextInvoiceDate: any;
    switch (repeat_type_custom) {
      case 'day':
        nextInvoiceDate = addDays(invoiceDate, Number(repeat_every_custom));
        break;
      case 'week':
        nextInvoiceDate = addWeeks(invoiceDate, Number(repeat_every_custom));
        break;
      case 'month':
        nextInvoiceDate = addMonths(invoiceDate, Number(repeat_every_custom));
        break;
      case 'year':
        nextInvoiceDate = addYears(invoiceDate, Number(repeat_every_custom));
        break;
      default:
        break;
    }
    return nextInvoiceDate ?? '';
  }

  async attachFiles() {
    const modal = await this.modalCtrl.create({
      component: AttachFilePage,
      cssClass: 'attach-file-modal',
      mode: 'ios',
      componentProps: {
        rel_type: 'invoice',
        rel_id: this.invoice.id
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.getInvoice();
      }
    });
    return await modal.present();
  }

  visibleToCustomer(event, index, attachment: any) {
    const status = attachment.visible_to_customer == 0 ? 1 : 0;
    this.miscApi.toggleFileVisibility(attachment.id).subscribe({
      next: (res: any) => {
        if (res.status == true) {
          this.invoice.attachments[index].visible_to_customer = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }, error: () => {
      }
    });
  }

   async deleteFile(file_id) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.attachFileApi.deleteAttachment(file_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.getInvoice();
            this.mpcToast.show(response.message);
          } else {
            this.mpcToast.show(response.message, 'danger');
          }
        }
      });
    }
    
  }
  
  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('sales_attachment', attachment_id).subscribe({
      next: async (response: any) => {
        const blobData = await this.blobToBase64(response);
        try {
          // Write the base64-encoded string to a file in the Documents directory
          const savedFile = await Filesystem.writeFile({
            path: filename,
            data: blobData,
            directory: Directory.Documents,
          });
          // Open the files using the FileOpener plugin
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: filetype,
            openWithDefault: true
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read Blob as base64.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
