import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, ModalController, ToastController } from '@ionic/angular';
import { EstimatesHelper, STATUS_ACCEPTED, STATUS_DECLINED, STATUS_DRAFT, STATUS_EXPIRED, STATUS_SENT } from 'src/app/classes/estimates-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { Browser } from '@capacitor/browser';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { FiltersPage as TaskFiltersPage } from '../../tasks/modals/filters/filters.page';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateEstimatePage } from 'src/app/pages/admin/estimates/create/create.page';
import { Subscription } from 'rxjs';
import { AttachFilePage } from '../../proposals/modals/attach-file/attach-file.page';
import { AttachFileApiService } from 'src/app/services/attach-file-api.service';
import { CommonHelper } from 'src/app/classes/common-helper';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { MiscApiService } from 'src/app/services/misc-api.service';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';


@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  @Input() estimateId: any;
  @Input() type = '';
  @Input() estimateInfo: any;
  estimate_id = this.activatedRoute.snapshot.paramMap.get('id');
  selectedTab = 'estimate';
  estimate: any;
  countries = [];
  currencies = [];
  totalTaxes: any[] = [];
  isLoading = true;

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    rel_type: 'estimate',
    rel_id: this.estimate_id,
    status: [],
    assigned: []
  };

  activities = [];

  notes = [];

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;
  private country$: Subscription;
  private currency$: Subscription;

  settings: any;
  isSearching = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private estimateApi: EstimateApiService,
    public taskApi: TaskApiService,
    private reminderApi: ReminderApiService,
    private noteApi: NoteApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private modalCtrl: ModalController,
    public estimateHelper: EstimatesHelper,
    public commonHelper: CommonHelper,
    public taskHelper: TasksHelper,
    public authService: AuthenticationService,
    private mpcToast: MpcToastService,
    private actionSheetController: ActionSheetController,
    private sharedService: SharedService,
    private attachFileApi: AttachFileApiService,
    private miscApi: MiscApiService,
    private downloadApi: DownloadApiService,
    private mpcAlert: MpcAlertService,
    private settingHelper: SettingsHelper,
    // private routerOutlet: IonRouterOutlet,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {

  }

  ngOnInit() {
    this.estimate_id = this.estimate_id ?? this.estimateId;
    this.taskAppliedFilters.rel_id = this.estimate_id;
    window.addEventListener("admin:estimate_updated", () => {
      this.getEstimate();
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.estimate = this.router.getCurrentNavigation().extras.state
        this.calculateEstimate();
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.estimateInfo) {
          this.estimate = this.estimateInfo;
          this.isLoading = false;
        } else {
          this.getEstimate();
        }
      }
    });

    this.country$ = this.countryApi.getCountriesData().subscribe(res => {
      if (!res) {
        this.countryApi.get().subscribe({
          next: async response => {
            this.countryApi.setCountriesData(response);
          }
        });
      } else {
        this.countries = res;
      }
    })
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
    });

    this.settingHelper.settings.subscribe(response => {
      this.settings = response;
    });
  }

  ngOnDestroy() {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  getEstimate(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.estimateApi.get(this.estimate_id).subscribe({
      next: (res: any) => {
        this.estimate = res;
        this.calculateEstimate();
        this.isLoading = false;
        this.sharedService.dispatchEvent({
          event: 'admin:get_estimate',
          data: this.estimate
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
  
      }, error: () => {
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.estimate_id, 'estimate', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
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
    this.isLoading = true
    this.estimateApi.getActivity(this.estimate_id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status !== false) {
          this.activities = res;
        }
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('estimate', this.estimate_id).subscribe({
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

  getCountryNameById(country_id: Number) {
    for (let country of this.countries) {
      if (country.country_id == country_id) {
        return country.short_name;
      }
    }
    return '';
  }

  getCurrencyNameById(currency_id: Number) {
    for (let currency of this.currencies) {
      if (currency.id == currency_id) {
        return currency.name + ' <small>' + currency.symbol + '</small>';
      }
    }
    return 'System Default';
  }

  calculateEstimate() {
    this.totalTaxes = [];
    this.estimate.items.forEach((item) => {
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

  showDiscount(estimate) {
    if (estimate?.discount_percent) {
      return estimate.discount_percent != 0 ? '(' + parseInt(estimate.discount_percent) + '%)' : '';
    }
    return '';
  }

  async addTask() {
    /* const extras: NavigationExtras = {
      state: {
        rel_type: 'estimate',
        rel_name: this.estimate.estimate_number,
        relational_values: {
          addedfrom: "1",
          id: this.estimate_id,
          name: `${this.estimate.estimate_number}`,
          subtext: '',
          type: 'estimate'
        },
        rel_id: this.estimate_id
      }
    };
    this.router.navigate(['admin/tasks/create'], extras); */
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'estimate',
          rel_name: this.estimate.estimate_number,
          relational_values: {
            addedfrom: "1",
            id: this.estimate_id,
            name: `${this.estimate.estimate_number}`,
            subtext: '',
            type: 'estimate'
          },
          rel_id: this.estimate_id
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

  async addEditReminder(reminder: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateReminderPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
      initialBreakpoint: 0.90,
      mode: 'ios',
      componentProps: {
        rel_type: 'estimate',
        rel_id: this.estimate_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getEstimate();
        this.getReminders();
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
        rel_id: this.estimate_id,
        rel_type: 'estimate',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getEstimate();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  view(id: any, data: any, tab = '') {
    const extras: NavigationExtras = {
      state: data
    };
    this.router.navigate(['admin/' + tab + 's/view', id], extras);
  }

  onSortingChange(sort: any, tab = '') {
    if (sort) {
      this[tab + '_offset'] = 0;
      this[tab + 's'] = [];
      this['get' + this.capitalizeFirstLetter(tab) + 's'](true);
    }
  }

  doRefresh(event: any, tab = '') {
    this[tab + '_offset'] = 0;
    this[tab + 's'] = [];
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  doEstimateRefresh(event: any, tab = '') {
    this.getEstimate(true, event);
  }

  doSearch(event: any, tab = '') {
    console.log('event', event.detail.value);
    this[tab + '_search'] = event.detail.value;
    this[tab + '_offset'] = 0;
    this[tab + 's'] = [];
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, false, true);
  }

  loadMore(event: any, tab = '') {
    this[tab + '_offset'] += this[tab + '_limit'];
    console.log(tab + '_offset:', this[tab + '_offset']);
    this['get' + this.capitalizeFirstLetter(tab) + 's'](false, event, false);
  }

  delete(id: any, index: any, tab = '') {
    this[tab + 'Api'].delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this[tab + 's'].splice(index, 1); //remove from list
        }
      }
    });
  }

  deleteEstimate() {
    this.estimateApi.delete(this.estimate_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.router.navigate(['/admin/estimates/list']);
          window.dispatchEvent(new CustomEvent('admin:refresh_data'));
        }
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'activity_log' && this.activities.length == 0) {
      this.getActivity();
    }

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes(true);
    }
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getPDF(action = 'view') {
    this.estimateApi.getPDF(this.estimate_id).subscribe({
      next: async (response: any) => {
        console.log(response);
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'estimate_' + this.estimate_id + '.pdf',
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

  viewEstimateAsCustomer() {
    console.log(this.authService.BASE_URL);
    Browser.open({
      url: this.authService.BASE_URL + '/estimate/' + this.estimate_id + '/' + this.estimate.hash
    });
  }

  copyEstimate() {
    this.estimateApi.copy(this.estimate_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:estimate_updated'));
          this.router.navigate(['/admin/estimates/edit/' + response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  convertToInvoice(status: any) {
    this.estimateApi.toInvoice(this.estimate_id, status).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_created'));
          this.router.navigate(['/admin/invoices/edit/' + response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  markAs(status: Number) {
    this.estimateApi.markAs(status, this.estimate_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getEstimate();
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

    if (this.authService.hasPermission('invoices', ['create'])) {
      _buttons.push({
        text: this.translate.instant('create_invoice_and_save_as_draft'),
        handler: () => {
          this.convertToInvoice(1);
        }
      },
        {
          text: this.translate.instant('create_invoice'),
          handler: () => {
            this.convertToInvoice(0);
          }
        })
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

  async openMore() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('view_estimate'),
      handler: () => {
        this.viewEstimateAsCustomer();
      }
    },
      {
        text: this.translate.instant('attach_file'),
        handler: () => {
          this.attachFiles();
        }
      });

    if (this.settings?.perfex_current_version >= '291' && this.authService.hasPermission('projects', ['create']) && this.estimate.project_id == 0) {
      _buttons.push({
        text: this.translate.instant('estimate_convert_to_project'),
        handler: () => {
          // this.attachFiles();
          this.estimate.type = 'estimate';
          const extras: NavigationExtras = {
            state: this.estimate
          };
          this.router.navigate(['admin/projects/create'], extras);
        }
      });
    }

    if (this.authService.hasPermission('estimates', ['create'])) {
      _buttons.push({
        text: this.translate.instant('copy_estimate'),
        handler: () => {
          this.copyEstimate();
        }
      });
    }

    if (this.authService.hasPermission('estimates', ['edit']) && this.estimate.status != STATUS_DRAFT && this.estimate.invoiceid == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_draft'),
        handler: () => {
          this.markAs(STATUS_DRAFT);
        }
      })
    }

    if (this.authService.hasPermission('estimates', ['edit']) && this.estimate.status != STATUS_SENT && this.estimate.invoiceid == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_sent'),
        handler: () => {
          this.markAs(STATUS_SENT);
        }
      })
    }

    if (this.authService.hasPermission('estimates', ['edit']) && this.estimate.status != STATUS_EXPIRED && this.estimate.invoiceid == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_expired'),
        handler: () => {
          this.markAs(STATUS_EXPIRED);
        }
      })
    }

    if (this.authService.hasPermission('estimates', ['edit']) && this.estimate.status != STATUS_DECLINED && this.estimate.invoiceid == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_declined'),
        handler: () => {
          this.markAs(STATUS_DECLINED);
        }
      })
    }

    if (this.authService.hasPermission('estimates', ['edit']) && this.estimate.status != STATUS_ACCEPTED && this.estimate.invoiceid == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_accepted'),
        handler: () => {
          this.markAs(STATUS_ACCEPTED);
        }
      })
    }

    /* _buttons.push({
      text: 'Delete',
      handler: () => {
        this.deleteEstimate();
      }
    }), */

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
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  async openFilters() {
    const modal = await this.modalCtrl.create({
      component: TaskFiltersPage,
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters: any) => {
      if (modalFilters.data) {
        this.isFiltered = false;
        this.taskAppliedFilters = modalFilters.data;

        if (this.taskAppliedFilters.status.length !== 0 || this.taskAppliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        this.task_offset = 0;
        this.tasks = [];
        this.getTasks(true);
      }
    });
    return await modal.present();

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

  goToPage(page) {
    this.router.navigate([`${page}`]);
  }

  async editEstimate(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateEstimatePage,
        mode: 'ios',
        componentProps: {
          estimateId: id,
          type: 'modal'
        }
      });

      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['admin/estimates/edit/', id]);
    }
  }

  async attachFiles() {
    const modal = await this.modalCtrl.create({
      component: AttachFilePage,
      cssClass: 'attach-file-modal',
      mode: 'ios',
      componentProps: {
        rel_type: 'estimate',
        rel_id: this.estimate.id
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.getEstimate();
      }
    });
    return await modal.present();
  }

  visibleToCustomer(event, index, attachment: any) {
    const status = attachment.visible_to_customer == 0 ? 1 : 0;
    this.miscApi.toggleFileVisibility(attachment.id).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.estimate.attachments[index].visible_to_customer = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }, error: () => {}
    });
  }

  async deleteFile(file_id) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if (confirmItem) {
      this.attachFileApi.deleteAttachment(file_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.getEstimate();
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
