import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FileOpener } from '@capacitor-community/file-opener';
import { Browser } from '@capacitor/browser';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, IonRouterOutlet, ModalController, NavController, ToastController } from '@ionic/angular';
import { ProposalsHelper, STATUS_ACCEPTED, STATUS_DECLINED, STATUS_DRAFT, STATUS_OPEN, STATUS_REVISED, STATUS_SENT } from 'src/app/classes/proposals-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreatePage as EstimateCreatePage } from '../../estimates/create/create.page';
import { CreatePage as InvoiceCreatePage } from '../../invoices/create/create.page';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { CreateCommentPage } from '../modals/create-comment/create-comment.page';
import { FiltersPage } from '../../tasks/modals/filters/filters.page';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateProposalPage } from 'src/app/pages/admin/proposals/create/create.page';
import { Subscription } from 'rxjs';
import { CreateTemplatePage } from '../modals/create-template/create-template.page';
import { AttachFilePage } from '../modals/attach-file/attach-file.page';
import { AttachFileApiService } from 'src/app/services/attach-file-api.service';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { CommonHelper } from 'src/app/classes/common-helper';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { MiscApiService } from 'src/app/services/misc-api.service';
import { TemplateApiService } from 'src/app/services/template-api.service';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { format } from 'date-fns'
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
  providers: [DateTimePipe]
})
export class ViewPage implements OnInit, OnDestroy {
  proposal_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() proposalId: any;
  @Input() type = '';
  @Input() proposalInfo: any;
  selectedTab = 'proposal';
  proposal: any;
  isSearching = false;


  STATUS_OPEN = STATUS_OPEN;
  STATUS_DECLINED = STATUS_DECLINED;
  STATUS_ACCEPTED = STATUS_ACCEPTED;
  STATUS_SENT = STATUS_SENT;
  STATUS_REVISED = STATUS_REVISED;
  STATUS_DRAFT = STATUS_DRAFT;

  comments = [];
  templates = [];
  notes = [];

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    proposal_id: this.proposal_id,
    rel_type: 'proposal',
    rel_id: this.proposal_id,
    status: '',
    assigned: ''
  };

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;

  countries = [];
  currencies = [];
  totalTaxes = [];
  isLoading = true;
  private country$: Subscription;
  private currency$: Subscription;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private proposalApi: ProposalApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private noteApi: NoteApiService,
    private reminderApi: ReminderApiService,
    public taskApi: TaskApiService,
    private templateApi: TemplateApiService,
    public modalCtrl: ModalController,
    public proposalHelper: ProposalsHelper,
    public commonHelper: CommonHelper,
    public authService: AuthenticationService,
    public taskHelper: TasksHelper,
    private mpcToast: MpcToastService,
    private actionSheetController: ActionSheetController,
    private sharedService: SharedService,
    private attachFileApi: AttachFileApiService,
    private miscApi: MiscApiService,
    private downloadApi: DownloadApiService,
    private mpcAlert: MpcAlertService,
    private dateTimePipe: DateTimePipe,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {

  }
  ngOnInit() {
    this.proposal_id = this.proposal_id ?? this.proposalId;
    this.taskAppliedFilters.rel_id = this.proposal_id;
    window.addEventListener("admin:proposal_updated", () => {
      this.getProposal();
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.proposal = this.router.getCurrentNavigation().extras.state;
        console.log('this.proposal extra =>', this.proposal);
        // this.calculateProposal();
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.proposalInfo) {
          this.proposal = this.proposalInfo;
          this.isLoading = false;
        } else {
          this.getProposal();
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
    })
  }
  ngOnDestroy(): void {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  getProposal(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.proposalApi.get(this.proposal_id).subscribe({
      next: (response: any) => {
        this.proposal = response;
        this.sharedService.dispatchEvent({
          event: 'admin:get_proposal',
          data: this.proposal
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

  getComments(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.proposalApi.getComments(this.proposal_id).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.comments = response;
        }
  
        if (event && response.length !== this.task_limit && refresh == false) {
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

  getTemplates(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.templateApi.get('','', null, null, {
      rel_type: 'proposals',
      rel_id: this.proposal_id
    }).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.templates = response;
        }
  
        if (event && response.length !== this.task_limit && refresh == false) {
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

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.proposal_id, 'proposal', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.reminders.push(...res);
          this.reminders = [...new Map(this.reminders.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.reminder_limit && refresh == false) {
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

  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('proposal', this.proposal_id).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.notes = response;
        }
        if (event && response.length !== this.task_limit && refresh == false) {
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

    this.taskAppliedFilters.proposal_id = this.proposal_id;
    this.taskApi.get('', this.task_search, this.task_offset, this.task_limit, this.taskAppliedFilters).subscribe((response: any) => {
      if (response.status !== false) {
        this.tasks.push(...response);
        this.tasks = [...new Map(this.tasks.map(item => [item?.id, item])).values()];
      }

      if (event && response.length !== this.task_limit && refresh == false) {
        event.target.disabled = true;
      }
      this.isLoading = false;
      if (event) {
        event.target.complete();
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

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  calculateProposal() {
    this.totalTaxes = [];
    this.proposal.items.forEach((item) => {
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

  showDiscount(proposal) {
    if (proposal?.discount_percent) {
      return proposal.discount_percent != 0 ? '(' + parseInt(proposal.discount_percent) + '%)' : '';
    }
    return '';
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

  doProposalRefresh(event: any, tab = '') {
    this.getProposal(true, event);
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
      next: (response: any) => {
        if (response.status) {
          this[tab + 's'].splice(index, 1); //remove from list
        }
      }
    });
  }

  viewTask(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tasks/view', id], extras);
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'comments' && this.comments.length == 0) {
      this.getComments();
    }
    if (event.detail.value == 'templates' && this.templates.length == 0) {
      this.getTemplates();
    }

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes();
    }
  }

  async addEditNote(note: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateNotePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        rel_id: this.proposal.id,
        rel_type: 'proposal',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getProposal();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  async addEditComment(comment: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateCommentPage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        proposal: this.proposal,
        comment: comment
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getProposal();
        this.getComments();
      }
    });
    return await modal.present();
  }

  async addEditTemplate(template: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateTemplatePage,
      breakpoints: [0, 0.25, 0.5, 0.75,1.0],
      initialBreakpoint: 0.75,
      mode: 'ios',
      componentProps: {
        rel_id: this.proposal.id,
        rel_type: 'proposals',
        template: template
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTemplates();
      }
    });
    return await modal.present();
  }

  async addTask() {
    /*     const extras: NavigationExtras = {
          state: {
            rel_type: 'proposal',
            rel_name: this.proposal_id,
            relational_values: {
              addedfrom: "1",
              id: this.proposal.id,
              name: this.proposal.proposal_number,
              subtext: '',
              type: 'proposal'
            },
            rel_id: this.proposal_id
          }
        };
        this.router.navigate(['admin/tasks/create'], extras); */
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'proposal',
          rel_name: this.proposal_id,
          relational_values: {
            addedfrom: "1",
            id: this.proposal.id,
            name: this.proposal.proposal_number,
            subtext: '',
            type: 'proposal'
          },
          rel_id: this.proposal.id
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
        rel_type: 'proposal',
        rel_id: this.proposal_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getProposal();
        this.getReminders();
      }
    });
    return await modal.present();
  }

  async convertToEstimate() {
    console.log('open Convert To Estimate Modal');

    if (this.proposal.rel_type == 'lead') {
      this.mpcToast.show('You need to convert the lead to customer in order to create Estimate', 'danger');
      return false;
    }

    const modal = await this.modalCtrl.create({
      component: EstimateCreatePage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        proposal: this.proposal
      }
    });

    modal.onDidDismiss().then((response) => {
      console.log(response);
      if (response.data) {
        console.log('Modal Sent Data : ', response.data);
        this.getProposal();
      }
    });
    return await modal.present();
  }

  async convertToInvoice() {
    console.log('open Convert To Invoice Modal');

    if (this.proposal.rel_type == 'lead') {
      this.mpcToast.show('You need to convert the lead to customer in order to create Invoice', 'danger');
      return false;
    }

    const modal = await this.modalCtrl.create({
      component: InvoiceCreatePage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        proposal: this.proposal
      }
    });

    modal.onDidDismiss().then((response) => {
      console.log(response);
      if (response.data) {
        console.log('Modal Sent Data : ', response.data);
        this.getProposal();
      }
    });
    return await modal.present();
  }

  async deleteComment(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.proposalApi.deleteComment(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.comments.splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  async deleteTemplate(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.templateApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.templates.splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  viewProposal() {
    Browser.open({
      url: this.authService.BASE_URL + '/proposal/' + this.proposal_id + '/' + this.proposal.hash
    });
  }

  getPDF(action = 'view') {
    this.proposalApi.getPDF(this.proposal_id).subscribe({
      next: async (response: any) => {
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'proposal_' + this.proposal_id + '.pdf',
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

  markAs(status: Number) {
    this.proposalApi.markAs(status, this.proposal_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getProposal();
        }
      }
    });
  }

  copyProposal() {
    this.proposalApi.copy(this.proposal_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:proposal_updated'));
          this.router.navigate(['/admin/proposals/edit/' + response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  deletePropsal() {
    this.proposalApi.delete(this.proposal_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.router.navigate(['/admin/proposals/list']);
          window.dispatchEvent(new CustomEvent('admin:proposal_deleted'));
        }
      }
    });
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
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

    if (this.authService.hasPermission('estimates', ['create'])) {
      _buttons.push({
        text: this.translate.instant('estimate'),
        handler: () => {
          this.convertToEstimate();
        }
      });
    }

    if (this.authService.hasPermission('invoices', ['create'])) {
      _buttons.push({
        text: this.translate.instant('invoice'),
        handler: () => {
          this.convertToInvoice();
        }
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

  async openMore() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('view_proposal_as_customer'),
      handler: () => {
        this.viewProposal();
      }
    });
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    console.log('currentDate =>', currentDate);
    if (this.proposal.open_till && (currentDate < this.proposal.open_till) && (this.proposal.status == STATUS_SENT || this.proposal.status == STATUS_OPEN)){
      _buttons.push({
        text: this.translate.instant('send_expiry_reminder'),
        handler: () => {
          this.sendExpirationReminder();
        }
      });
    }

    _buttons.push({
      text: this.translate.instant('attach_file'),
      handler: () => {
        this.attachFiles();
      }
    });

    if (this.authService.hasPermission('proposals', ['create'])) {
      _buttons.push({
        text: this.translate.instant('copy'),
        handler: () => {
          this.copyProposal();
        }
      });
    }
    if (this.authService.hasPermission('proposals', ['edit']) && this.proposal.status != STATUS_DRAFT && this.proposal.estimate_id == null && this.proposal.invoice_id == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_draft'),
        handler: () => {
          this.markAs(STATUS_DRAFT);
        }
      });
    }

    if (this.authService.hasPermission('proposals', ['edit']) && this.proposal.status != STATUS_SENT && this.proposal.estimate_id == null && this.proposal.invoice_id == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_sent'),
        handler: () => {
          this.markAs(STATUS_SENT);
        }
      });
    }

    if (this.authService.hasPermission('proposals', ['edit']) && this.proposal.status != STATUS_OPEN && this.proposal.estimate_id == null && this.proposal.invoice_id == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_open'),
        handler: () => {
          this.markAs(STATUS_OPEN);
        }
      });
    }

    if (this.authService.hasPermission('proposals', ['edit']) && this.proposal.status != STATUS_REVISED && this.proposal.estimate_id == null && this.proposal.invoice_id == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_revised'),
        handler: () => {
          this.markAs(STATUS_REVISED);
        }
      });
    }

    if (this.authService.hasPermission('proposals', ['edit']) && this.proposal.status != STATUS_DECLINED && this.proposal.estimate_id == null && this.proposal.invoice_id == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_declined'),
        handler: () => {
          this.markAs(STATUS_DECLINED);
        }
      });
    }

    if (this.authService.hasPermission('proposals', ['edit']) && this.proposal.status != STATUS_ACCEPTED && this.proposal.estimate_id == null && this.proposal.invoice_id == null) {
      _buttons.push({
        text: this.translate.instant('mark_as_accepted'),
        handler: () => {
          this.markAs(STATUS_ACCEPTED);
        }
      });
    }

    _buttons.push({
      text: this.translate.instant('_delete'),
      cssClass: 'proposal-action-sheet-delete-button',
      handler: async () => {
        const confirmItem = await this.mpcAlert.deleteAlertMessage();
        if(confirmItem){
          this.deletePropsal();
        }
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

  async openFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: FiltersPage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.taskAppliedFilters = modalFilters.data;

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

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
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

  async editProposal(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateProposalPage,
        mode: 'ios',
        componentProps: {
          proposalId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });

      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['admin/proposals/edit/', id]);
    }
  }

  async attachFiles() {
    const modal = await this.modalCtrl.create({
      component: AttachFilePage,
      cssClass: 'attach-file-modal',
      mode: 'ios',
      componentProps: {
        rel_type: 'proposal',
        rel_id: this.proposal.id
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.getProposal();
      }
    });
    return await modal.present();
  }

  visibleToCustomer(event, index, attachment: any) {
    const status = attachment.visible_to_customer == 0 ? 1 : 0;
    this.miscApi.toggleFileVisibility(attachment.id).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.proposal.attachments[index].visible_to_customer = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }
    });
  }

  async deleteFile(file_id) {4
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.attachFileApi.deleteAttachment(file_id, 'proposals').subscribe({
        next: (response: any) => {
          if (response.status) {
            this.getProposal();
            this.mpcToast.show(response.message);
          } else {
            this.mpcToast.show(response.message, 'danger');
          }
        }
      });
    }
  }

  sendExpirationReminder(){
    this.proposalApi.sendExpirationReminder(this.proposal.id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getProposal();
          this.mpcToast.show(response.message);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
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
