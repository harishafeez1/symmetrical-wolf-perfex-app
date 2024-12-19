import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ContactApiService } from 'src/app/services/contact-api.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { PaymentApiService } from 'src/app/services/payment-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreateContactPage } from '../modals/create-contact/create-contact.page';
import { CreatePage as CreateInvoicePage } from '../../invoices/create/create.page';
import { CreatePage as UpdateProposalPage} from '../../proposals/create/create.page';
import { CreatePage as CreateProposalPage} from '../../proposals/create/create.page';
import { CreatePage as UpdatePaymentPage} from '../../payments/create/create.page';
import { CreatePage as CreateCreditNotePage } from '../../credit_notes/create/create.page';
import { CreatePage as CreateEstimatePage } from '../../estimates/create/create.page';
import { CreatePage as UpdateEstimatePage } from '../../estimates/create/create.page';
import { CreatePage as CreateProjectPage} from '../../projects/create/create.page';
import { CreatePage as UpdateProjectPage} from '../../projects/create/create.page';
import { CreatePage as CreateTaskPage} from '../../tasks/create/create.page';
import { FiltersPage as TaskFiltersPage } from '../../tasks/modals/filters/filters.page'; 
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { formatDistance } from 'date-fns';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { TicketApiService } from 'src/app/services/ticket-api.service';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  customer_id = this.activatedRoute.snapshot.paramMap.get('id');
  selectedTab2 = 'customer_details';
  selectedTab = 'profile';
  customer: any;
  countries = [];
  currencies = [];
  isLoading = true;
  isMpcLoading = false;

  contacts = [];
  contact_search = '';
  contact_offset = 0;
  contact_limit = 20;
  contactAppliedFilters = {
    userid: this.customer_id
  };

  notes = [];

  invoices = [];
  invoice_search = '';
  invoice_offset = 0;
  invoice_limit = 20;
  invoiceAppliedFilters = {
    clientid: this.customer_id
  };

  payments = [];
  payment_search = '';
  payment_offset = 0;
  payment_limit = 20;

  proposals = [];
  proposal_search = '';
  proposal_offset = 0;
  proposal_limit = 20;

  estimates = [];
  estimate_search = '';
  estimate_offset = 0;
  estimate_limit = 20;
  estimateAppliedFilters = {
    clientid: this.customer_id
  };

  projects = [];
  project_search = '';
  project_offset = 0;
  project_limit = 20;
  projectAppliedFilters = {
    clientid: this.customer_id
  };

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    rel_type: 'customer',
    rel_id: this.customer_id,
    status: [],
    assigned: []
  };

  credit_notes = [];
  credit_note_search = '';
  credit_note_offset = 0;
  credit_note_limit = 20;
  creditNoteAppliedFilters = {
    clientid: this.customer_id
  };
  tickets = [];
  ticket_search = '';
  ticket_offset = 0;
  ticket_limit = 20;
  ticketAppliedFilters = {
    clientid: this.customer_id
  };
  private country$: Subscription;
  private currency$: Subscription;
  isSearching = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private customerApi: CustomerApiService,
    public contactApi: ContactApiService,
    private noteApi: NoteApiService,
    public invoiceApi: InvoiceApiService,
    public paymentApi: PaymentApiService,
    public proposalApi: ProposalApiService,
    public estimateApi: EstimateApiService,
    public projectApi: ProjectApiService,
    public taskApi: TaskApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private invoiceHelper: InvoicesHelper,
    private proposalHelper: ProposalsHelper,
    private estimateHelper: EstimatesHelper,
    private projectHelper: ProjectsHelper,
    public taskHelper: TasksHelper,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private sharedService: SharedService,
    private nav: NavController,
    private mpcToast: MpcToastService,
    private mpcAlert: MpcAlertService,
    public creditNoteApi: CreditNoteApiService,
    private ticketApi: TicketApiService,
    private animationService: AnimationService,
    // private routerOutlet: IonRouterOutlet
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.customer = this.router.getCurrentNavigation().extras.state;
        this.isLoading = false;
      } else {
        this.getCustomer();
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
    this.currency$ = this.currencyApi.getCurrenciesData().subscribe(async res => {
      if (!res) {
        this.currencyApi.get().subscribe({
          next: response => {
            this.currencyApi.setCurrenciesData(response);
          }
        });
      } else {
        this.currencies = await res;
      }
    })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  getCustomer(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.customerApi.get(this.customer_id).subscribe({
      next: (res) => {
        console.log('customer res view =>', res);
        this.customer = res;
  
        this.sharedService.dispatchEvent({
          event: 'admin:get_customer',
          data: this.customer
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

  getContacts(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.contactApi.get('', this.contact_search, this.contact_offset, this.contact_limit, this.contactAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.contacts.push(...res);
          this.contacts = [...new Map(this.contacts.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.contact_limit && refresh == false) {
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
    this.noteApi.get('customer', this.customer_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.notes = res;
        }
  
        if (event && res.length !== this.contact_limit && refresh == false) {
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
        console.log('invoice response =>', res);
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

  getPayments(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.paymentApi.get('', this.payment_search, this.payment_offset, this.payment_limit, {
      clientid: this.customer_id
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.payments.push(...res);
          this.payments = [...new Map(this.payments.map(item => [item?.id, item])).values()];
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

  getProposals(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.proposalApi.get('', this.proposal_search, this.proposal_offset, this.proposal_limit, {
      rel_type: 'customer',
      rel_id: this.customer_id
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.proposals.push(...res);
          this.proposals = [...new Map(this.proposals.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.proposal_limit && refresh == false) {
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

  getEstimates(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.estimateApi.get('', this.estimate_search, this.estimate_offset, this.estimate_limit, this.estimateAppliedFilters).subscribe({
      next: (res: any) => {
        console.log('res =>', res);
        if (res.status !== false) {
          this.estimates.push(...res);
          this.estimates = [...new Map(this.estimates.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.estimate_limit && refresh == false) {
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

  getProjects(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.projectApi.get('', this.project_search, this.project_offset, this.project_limit, this.projectAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.project_limit && refresh == false) {
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
  getTickets(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.ticketApi.get('', this.ticket_search, this.ticket_offset, this.ticket_limit, this.ticketAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.tickets.push(...res);
          this.tickets = [...new Map(this.tickets.map(item => [item?.ticketid, item])).values()];
        }
  
        if (event && res.length !== this.ticket_limit && refresh == false) {
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
    console.log('refresh =>', refresh, 'event =>', event);
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
    return this.projectHelper.get_project_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).color;
  }

  _getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  _getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  async addEditContact(contact: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateContactPage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        userid: this.customer_id,
        contact: contact
      },
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getCustomer();
        this.getContacts();
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
        rel_id: this.customer_id,
        rel_type: 'customer',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getCustomer();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  notesRefresh(event){
    if(event){
      this.getNotes();
    }
  }

  async addProposal() {
    // const extras: NavigationExtras = {
    //   state: {
    //     rel_type: 'customer',
    //     rel_name: this.customer.company,
    //     relational_values: {
    //       addedfrom: "1",
    //       id: this.customer_id,
    //       name: `${this.customer.company}`,
    //       subtext: '',
    //       type: 'customer'
    //     },
    //     rel_id: this.customer_id,
    //     name: this.customer.name,
    //     email: this.customer.email
    //   }
    // };
    // this.router.navigate(['admin/proposals/create'], extras);
    const modal = await this.modalCtrl.create({
      component: CreateProposalPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'customer',
          rel_name: this.customer.company,
          relational_values: {
            addedfrom: "1",
            id: this.customer_id,
            name: `${this.customer.company}`,
            subtext: '',
            type: 'customer'
          },
          rel_id: this.customer_id,
          name: this.customer.name,
          email: this.customer.email
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

  async addEstimate() {
    const modal = await this.modalCtrl.create({
      component: CreateEstimatePage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          company: this.customer.company,
          userid: this.customer_id,
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
  async addCreditNote() {
    const modal = await this.modalCtrl.create({
      component: CreateCreditNotePage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          company: this.customer.company,
          userid: this.customer_id,
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

  async addProject() {
    const modal = await this.modalCtrl.create({
      component: CreateProjectPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          company: this.customer.company,
          userid: this.customer_id,
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

  async addTask() {
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'customer',
          rel_name: this.customer.company,
          relational_values: {
            id: this.customer_id,
            name: `${this.customer.company}`,
            subtext: '',
            type: 'customer'
          },
          rel_id: this.customer_id
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

  doCustomerRefresh(event: any, tab = '') {
    this.getCustomer(true, event);
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

  async delete(id: any, index: any, tab = '') {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this[tab + 'Api'].delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this[tab + 's'].splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'contacts' && this.contacts.length == 0) {
      this.getContacts(true);
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes();
    }

    if (event.detail.value == 'invoices' && this.invoices.length == 0) {
      this.getInvoices(true);
    }

    if (event.detail.value == 'payments' && this.payments.length == 0) {
      this.getPayments(true);
    }

    if (event.detail.value == 'proposals' && this.proposals.length == 0) {
      this.getProposals(true);
    }

    if (event.detail.value == 'estimates' && this.estimates.length == 0) {
      this.getEstimates(true);
    }

    if (event.detail.value == 'projects' && this.projects.length == 0) {
      this.getProjects(true);
    }

    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }
    if (event.detail.value == 'tickets' && this.tickets.length == 0) {
      this.getTickets(true);
    }
    if (event.detail.value == 'credit_notes' && this.credit_notes.length == 0) {
      this.getCreditNotes(true);
    }
  }

  segmentChanged2(event: any) {
    this.selectedTab2 = event.detail.value;
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async addInvoice(){
    const modal = await this.modalCtrl.create({
      component: CreateInvoicePage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'customer',
          rel_id: this.customer_id,
          client: this.customer
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

/*   async updateInvoice(invoiceId:any){
    const modal = await this.modalCtrl.create({
      component: CreateInvoicePage,
      mode: 'ios',
      componentProps: {
        invoiceId: invoiceId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log('modal =>', modalFilters);
    });
    return await modal.present();
  } */
  
  async updateProposal(proposalId:any){
    const modal = await this.modalCtrl.create({
      component: UpdateProposalPage,
      mode: 'ios',
      componentProps: {
        proposalId: proposalId,
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
  
  async updatePayment(paymentId:any){
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
  
  async updateEsitmate(estimateId){
    const modal = await this.modalCtrl.create({
      component: UpdateEstimatePage,
      mode: 'ios',
      componentProps: {
       estimateId,
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
  
  async updateProject(projectId:any){
    const modal = await this.modalCtrl.create({
      component: UpdateProjectPage,
      mode: 'ios',
      componentProps: {
        projectId,
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
  
  async openFilters() {
    const modal = await this.modalCtrl.create({
      component: TaskFiltersPage,
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters:any) => {
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
  
  goToPage(page, back = false){
    // this.router.navigate([`${page}`]);
    if(!back) {
      this.nav.navigateForward(page);
    } else {
      this.nav.navigateBack(page);
    }
  }
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
  contactChangeStatus(index, contact: any) {
    console.log('contact =>', contact);
    this.isMpcLoading = true;
    const status = contact.active == 0 ? 1 : 0;
    this.contactApi.changeStatus(contact?.id, status).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.contacts[index].active = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isMpcLoading = false;
      }, error: () => {
        this.isMpcLoading = false;
      }
    });
  }
  getDateDuration(date) {
    return (formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      includeSeconds: false
    })).replace('about ', '');
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
