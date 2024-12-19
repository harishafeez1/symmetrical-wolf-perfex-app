import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { ActionSheetController, IonItemSliding, ModalController } from '@ionic/angular';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { ProjectsHelper, STATUS_FINISHED, STATUS_IN_PROGRESS, STATUS_NOT_STARTED, STATUS_ON_HOLD,STATUS_CANCELLED } from 'src/app/classes/projects-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { ExpenseApiService } from 'src/app/services/expense-api.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { MilestoneApiService } from 'src/app/services/milestone-api.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { TicketApiService } from 'src/app/services/ticket-api.service';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreateMilestonePage } from '../modals/create-milestone/create-milestone.page';
import { CreateTimesheetPage } from '../../tasks/modals/create-timesheet/create-timesheet.page';
import { CreditNotesHelper } from 'src/app/classes/credit-notes-helper';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { SubscriptionApiService } from 'src/app/services/subscription-api.service';
import { FiltersPage } from '../../estimates/modals/filters/filters.page';
import { FiltersPage as TaskFiltersPage } from '../../tasks/modals/filters/filters.page';
import { CreateDiscussionPage } from '../modals/create-discussion/create-discussion.page';

import { CreatePage } from '../../tasks/create/create.page';
import { CreatePage as CreateInvoicePage } from '../../invoices/create/create.page';
import { CreatePage as UpdateExpensePage } from '../../expenses/create/create.page';
import { CreatePage as CreateExpensePage } from '../../expenses/create/create.page';
import { CreatePage as UpdateCreditNotePage } from '../../credit_notes/create/create.page';
import { CreatePage as UpdateEstimatePage } from '../../estimates/create/create.page';
import { CreatePage as UpdateTicketPage } from '../../tickets/create/create.page';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateProjectPage } from 'src/app/pages/admin/projects/create/create.page';
import { formatDistance, subDays } from 'date-fns'
import { Subscription } from 'rxjs';
import { GetResult, Preferences } from '@capacitor/preferences';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { ContactApiService } from 'src/app/services/contact-api.service';
import { CommonHelper } from 'src/app/classes/common-helper';
import { CopyProjectPage } from '../modals/copy-project/copy-project.page';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { EditorOption } from 'src/app/constants/editor';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  project_id = this.activatedRoute.snapshot.paramMap.get('id');
  primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
  isDark = false;

  @Input() projectId: any;
  @Input() type = '';
  @Input() projectInfo: any;

  file: File;
  options = this.projectHelper.eChatOptions();
  mergeOptions: any = {};

  selectedTab = 'project_overview';
  selectedStatFilter = 'this_week';

  available_features = [];
  project: any;
  countries = [];
  currencies = [];
  isLoading = true;

  activities = [];
  files = [];
  notes = [];

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    project_id: this.project_id,
    rel_type: 'project',
    rel_id: this.project_id,
    status: '',
    assigned: ''
  };

  invoices = [];
  invoice_search = '';
  invoice_offset = 0;
  invoice_limit = 20;
  invoiceAppliedFilters = {
    project_id: this.project_id
  };

  estimates = [];
  estimate_search = '';
  estimate_offset = 0;
  estimate_limit = 20;
  estimateAppliedFilters = {
    project_id: this.project_id,
    status: [],
    sale_agent: false
  };

  subscriptions = [];
  subscription_search = '';
  subscription_offset = 0;
  subscription_limit = 20;
  subscriptionAppliedFilters = {
    project_id: this.project_id
  };

  milestones = [];
  milestone_search = '';
  milestone_offset = 0;
  milestone_limit = 20;
  milestoneAppliedFilters = {
    project_id: this.project_id
  };

  expenses = [];
  expense_search = '';
  expense_offset = 0;
  expense_limit = 20;
  expenseAppliedFilters = {
    project_id: this.project_id
  };

  credit_notes = [];
  credit_note_search = '';
  credit_note_offset = 0;
  credit_note_limit = 20;
  creditNoteAppliedFilters = {
    project_id: this.project_id
  };

  tickets = [];
  ticket_search = '';
  ticket_offset = 0;
  ticket_limit = 20;
  ticketAppliedFilters = {
    project_id: this.project_id
  };

  discussions = [];
  discussion_search = '';
  discussion_offset = 0;
  discussion_limit = 20;
  discussionAppliedFilters = {
    project_id: this.project_id
  };

  proposals = [];
  proposal_search = '';
  proposal_offset = 0;
  proposal_limit = 20;

  contracts = [];
  contract_search = '';
  contract_offset = 0;
  contract_limit = 20;
  contractAppliedFilters = {
    project_id: this.project_id
  };

  staffs = [];
  project_member_ids = [];

  dayDuration: any;
  private country$: Subscription;
  private currency$: Subscription;

  expenseSlideOpts = {
    slidesPerView: 'auto',
    spaceBetween: 20,
    pagination: false,
    freeMode: true
  };

  editorOption = EditorOption;

  formGroup: FormGroup;
  submitting = false;
  isSearching = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private projectApi: ProjectApiService,
    public projectHelper: ProjectsHelper,
    public taskHelper: TasksHelper,
    private crediNoteHelper: CreditNotesHelper,
    private estimateHelper: EstimatesHelper,
    public commonHelper: CommonHelper,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    public taskApi: TaskApiService,
    private milestoneApi: MilestoneApiService,
    public estimateApi: EstimateApiService,
    public subscriptionApi: SubscriptionApiService,
    public expenseApi: ExpenseApiService,
    public creditNoteApi: CreditNoteApiService,
    public ticketApi: TicketApiService,
    private staffApi: StaffApiService,
    public invoiceApi: InvoiceApiService,
    private noteApi: NoteApiService,
    private actionSheetController: ActionSheetController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private fb: UntypedFormBuilder,
    private mpcAlert: MpcAlertService,
    public proposalApi: ProposalApiService,
    private contactApi: ContactApiService,
    private downloadApi: DownloadApiService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.toggleDarkTheme();
    });
  }

  toggleDarkTheme() {
    Preferences.get({ key: "dark-mode" }).then((storage: GetResult) => {
      if (storage.value == 'on') {
        this.isDark = true;
      } else if (storage.value == 'off') {
        this.isDark = false;
      } else {
        this.isDark = prefersDark.matches;
      }

      this.mergeOptions.darkMode = this.isDark;
      if (this.isDark) {
        this.mergeOptions.yAxis = this.options.yAxis = {
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#474D66'
            }
          }
        };
      } else {
        this.mergeOptions.yAxis = this.options.yAxis = {
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#E9E9E9'
            }
          }
        };
      }
    });
  }

  ngOnInit(): void {
    this.toggleDarkTheme();

    this.project_id = this.project_id ?? this.projectId;
    this.taskAppliedFilters.rel_id = this.project_id;
    this.invoiceAppliedFilters.project_id = this.project_id;
    this.estimateAppliedFilters.project_id = this.project_id;
    this.subscriptionAppliedFilters.project_id = this.project_id;
    this.milestoneAppliedFilters.project_id = this.project_id;
    this.expenseAppliedFilters.project_id = this.project_id;
    this.creditNoteAppliedFilters.project_id = this.project_id;
    this.ticketAppliedFilters.project_id = this.project_id;
    this.discussionAppliedFilters.project_id = this.project_id;
    this.contractAppliedFilters.project_id = this.project_id;

    this.formGroup = this.fb.group({
      content: ['', [Validators.required]],
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.project = this.router.getCurrentNavigation().extras.state;
        this.calculateDateDuration();
        this.isLoading = false;
        this.availableFeatures(this.project?.settings?.available_features);
        this.getStaffs();
        this.formGroup.get('content').setValue(this.project.staff_notes);
      } else {
        if (this.type === 'modal' && this.projectInfo) {
          this.project = this.projectInfo;
          this.calculateDateDuration();
          this.isLoading = false;
          this.availableFeatures(this.project?.settings?.available_features);
          this.getStaffs(false);
          this.formGroup.get('content').setValue(this.project.staff_notes);
        } else {
          this.getProject();
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

    this.applyStatsFilter();
  }

  ngOnDestroy(): void {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  availableFeatures(features) {
    this.available_features = [];
    for (let feature in features) {
      if (features[feature] !== 0) {
        if(feature !== 'project_contracts'){
          this.available_features.push(feature);
        }
      }
    }
  }

  getStaffs(isLoading = true) {
    this.isLoading = isLoading;
    this.staffApi.get().subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.staffs = response;
          this.project_member_ids = [];
          for (let project_member of this.project.project_members) {
            this.project_member_ids.push(project_member.staffid);
          }
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  openSlide(itemSlide: IonItemSliding) {
    itemSlide.open('start');
  }

  getProject(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.projectApi.get(this.project_id).subscribe({
      next: (res) => {
        this.project = res;
        this.calculateDateDuration();
        this.availableFeatures(this.project?.settings?.available_features);
        this.getStaffs(isLoading);
        this.formGroup.get('content').setValue(this.project.staff_notes);
  
        this.sharedService.dispatchEvent({
          event: 'admin:get_project',
          data: this.project
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

  calculateDateDuration() {
    const currentDate = new Date();
    const deadlineDate = this.project.deadline ? new Date(this.project.deadline) : new Date();
    if (currentDate > deadlineDate) {
      this.dayDuration = formatDistance(deadlineDate, currentDate, { addSuffix: true });
    }
  }

  applyStatsFilter(selectedStatFilter = 'this_week') {
    this.selectedStatFilter = selectedStatFilter;
    this.projectApi.getChartData(this.project_id, selectedStatFilter).subscribe({
      next: (response: any) => {
        this.mergeOptions = response;
  
        for (const index in this.mergeOptions.series[0].color) {
          this.mergeOptions.series[0].color[index] = this.primaryColor;
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

  getMilestones(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.milestoneApi.get('', this.milestone_search, this.milestone_offset, this.milestone_limit, this.milestoneAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.milestones.push(...res);
          this.milestones = [...new Map(this.milestones.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.milestone_limit && refresh == false) {
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

  getSubscriptions(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.subscriptionApi.get('', this.subscription_search, this.subscription_offset, this.subscription_limit, this.subscriptionAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.subscriptions.push(...res);
          this.subscriptions = [...new Map(this.subscriptions.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.subscription_limit && refresh == false) {
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

  getExpenses(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.expenseApi.get('', this.expense_search, this.expense_offset, this.expense_limit, this.expenseAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.expenses.push(...res);
          this.expenses = [...new Map(this.expenses.map(item => [item?.expenseid, item])).values()];
        }
  
        if (event && res.length !== this.expense_limit && refresh == false) {
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

  getTasks(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskAppliedFilters.project_id = this.project_id;
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

  getDiscussions(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskAppliedFilters.project_id = this.project_id;
    this.projectApi.getDiscussions('', this.discussion_search, this.discussion_offset, this.discussion_limit, this.discussionAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.discussions.push(...res);
          this.discussions = [...new Map(this.discussions.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.discussion_limit && refresh == false) {
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
      project_id: this.project_id
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
  getContracts(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.contactApi.get('', this.contract_search, this.contract_offset, this.contract_limit, this.contractAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.contracts.push(...res);
          this.contracts = [...new Map(this.contracts.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.contract_limit && refresh == false) {
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

  getCNStatusNameByStatusId(status) {
    return this.crediNoteHelper.get_status_by_id(status).name;
  }

  getCNStatusColorByStatusId(status) {
    return this.crediNoteHelper.get_status_by_id(status).color;
  }

  getFiles(refresh = false, event: any = false, isLoading = true) {
    this.projectApi.getFiles(this.project_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.files = res;
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

  getActivity(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.projectApi.getActivity(this.project_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.activities = res;
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

  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.noteApi.get('project', this.project_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.notes = res;
        }
  
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

  async viewTask(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tasks/view', id], extras);
  }

  viewInvoice(id: any, invoice: any) {
    const extras: NavigationExtras = {
      state: invoice
    };
    this.router.navigate(['admin/invoices/view', id], extras);
  }

  viewExpense(id: any, expense: any) {
    const extras: NavigationExtras = {
      state: expense
    };
    this.router.navigate(['admin/expenses/view', id], extras);
  }

  viewEstimate(id: any, estimate: any) {
    const extras: NavigationExtras = {
      state: estimate
    };
    this.router.navigate(['admin/estimates/view', id], extras);
  }

  viewTicket(id: any, ticket: any) {
    const extras: NavigationExtras = {
      state: ticket
    };
    this.router.navigate(['admin/tickets/view', id], extras);
  }

  viewTimesheet(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tasks/view', id], extras);
  }

  viewCreditNote(id: any, credit_note: any) {
    const extras: NavigationExtras = {
      state: credit_note
    };
    this.router.navigate(['admin/credit_notes/view', id], extras);
  }

  async addEditNote(note: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateNotePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        rel_id: this.project_id,
        rel_type: 'project',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getProject();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  saveNotes() {
    this.submitting = true;
    this.projectApi.saveNotes(this.project_id, this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getProject();
        }
        this.submitting = false;
      }, error: () => {this.submitting = false}
    });
  }

  async addEditDiscussion(discussion: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateDiscussionPage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        project_id: this.project_id,
        discussion: discussion
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getProject();
        this.getDiscussions();
      }
    });
    return await modal.present();
  }

  async addEditMilestone(milestone: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateMilestonePage,
      breakpoints: [0, 0.25, 0.5, 0.75, 1],
      initialBreakpoint: 0.75,
      mode: 'ios',
      componentProps: {
        project_id: this.project_id,
        milestone: milestone
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getProject();
        this.getMilestones();
      }
    });
    return await modal.present();
  }

  async addTask() {
    // const extras: NavigationExtras = {
    //   state: {
    //     rel_type: 'project',
    //     rel_name: this.project.name,
    //     relational_values: {
    //       addedfrom: "1",
    //       id: this.project.id,
    //       name: `#${this.project.id} - ${this.project.name} - ${this.project.client_data.company}`,
    //       subtext: '',
    //       type: 'project'
    //     },
    //     rel_id: this.project_id
    //   }
    // };
    // this.router.navigate(['admin/tasks/create'], extras);
    const modal = await this.modalCtrl.create({
      component: CreatePage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'project',
          rel_name: this.project.name,
          relational_values: {
            addedfrom: "1",
            id: this.project.id,
            name: `#${this.project.id} - ${this.project.name} - ${this.project.client_data.company}`,
            subtext: '',
            type: 'project'
          },
          rel_id: this.project_id
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
      component: CreatePage,
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

  async updateInvoice(invoiceId: any) {
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
      console.log(modalFilters);
    });
    return await modal.present();
  }

  async addExpense() {
    const modal = await this.modalCtrl.create({
      component: CreateExpensePage,
      mode: 'ios',
      componentProps: {
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

  async updateExpense(expenseId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateExpensePage,
      mode: 'ios',
      componentProps: {
        expenseId: expenseId,
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

  async updateCreditNote(creditNoteId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateCreditNotePage,
      mode: 'ios',
      componentProps: {
        creditNoteId: creditNoteId,
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

  async updateEstimate(estimateId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateEstimatePage,
      mode: 'ios',
      componentProps: {
        estimateId: estimateId,
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

  async updateTicket(ticketId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateTicketPage,
      mode: 'ios',
      componentProps: {
        ticketId: ticketId,
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

  addProjectMember(event: any) {
    this.projectApi.addProjectMember(this.project_id, event.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getProject();
        }
      }
    });
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

  doProjectRefresh(event: any, tab = '') {
    this.getProject(true, event);
  }

  doActivityRefresh(event: any, tab = '') {
    this.getActivity(true, event);
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

 async deleteDiscussion(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.projectApi.deleteDiscussion(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.discussions.splice(index, 1); //remove from list
            itemSlide.close();
            this.mpcToast.show(res.message);
          } else {
            this.mpcToast.show(res.message, 'danger');
          }
        }
      });
    }
  }

  deleteCreditNote(id: any, index: any) {
    this.creditNoteApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.credit_notes.splice(index, 1); //remove from list
        }
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'project_tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'project_invoices' && this.invoices.length == 0) {
      this.getInvoices(true);
    }

    if (event.detail.value == 'project_milestones' && this.milestones.length == 0) {
      this.getMilestones(true);
    }

    if (event.detail.value == 'project_estimates' && this.estimates.length == 0) {
      this.getEstimates(true);
    }

    if (event.detail.value == 'project_subscriptions' && this.subscriptions.length == 0) {
      this.getSubscriptions(true);
    }

    if (event.detail.value == 'project_expenses' && this.expenses.length == 0) {
      this.getExpenses(true);
    }

    if (event.detail.value == 'project_credit_notes' && this.credit_notes.length == 0) {
      this.getCreditNotes(true);
    }

    if (event.detail.value == 'project_tickets' && this.tickets.length == 0) {
      this.getTickets(true);
    }

    if (event.detail.value == 'project_activity' && this.activities.length == 0) {
      this.getActivity(true);
    }

    if (event.detail.value == 'project_discussions' && this.discussions.length == 0) {
      this.getDiscussions();
    }

    if (event.detail.value == 'project_files' && this.files.length == 0) {
      this.getFiles();
    }

    if (event.detail.value == 'project_timesheets') {
      this.getTasks(true);
    }
    if (event.detail.value == 'project_proposals' && this.proposals.length == 0) {
      this.getProposals(true);
    }
    /* if (event.detail.value == 'project_contracts' && this.contracts.length == 0) {
      this.getContracts(true);
    } */
  }

  projectBillingType(id) {
    let type = '';
    if (id == 1) {
      type = 'project_billing_type_fixed_cost';
    } else if (id == 2) {
      type = 'project_billing_type_project_hours';
    } else {
      type = 'project_billing_type_project_task_hours';
    }
    return type;
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  deleteProject() {
    this.projectApi.deleteProject(this.project_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.router.navigate(['/admin/projects/list']);
          window.dispatchEvent(new CustomEvent('admin:refresh_data'));
        }
      }
    });
  }

  async deleteTimeSheet(id: any, index: any, task: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteTimeSheet(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            task.timesheets.splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  async addEditTimeSheet(timesheet: any = null, task: any = null) {
    const modal = await this.modalCtrl.create({
      component: CreateTimesheetPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 1.0],
      initialBreakpoint: 0.75,
      mode: 'ios',
      componentProps: {
        project_id: this.project_id,
        timesheet: timesheet,
        task: task
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTasks();
      }
    });
    return await modal.present();
  }

  markAs(status: Number) {
    this.projectApi.markAs(status, this.project_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getProject();
        }
      }
    });
  }

  async openUpdateStatus() {
    let _buttons = [];

    if (this.authService.hasPermission('projects', ['edit']) && this.project.status != STATUS_NOT_STARTED) {
      _buttons.push({
        text: this.translate.instant('mark_as_not_started'),
        handler: () => {
          this.markAs(STATUS_NOT_STARTED);
        }
      });
    }

    if (this.authService.hasPermission('projects', ['edit']) && this.project.status != STATUS_IN_PROGRESS) {
      _buttons.push({
        text: this.translate.instant('mark_as_in_progress'),
        handler: () => {
          this.markAs(STATUS_IN_PROGRESS);
        }
      });
    }

    if (this.authService.hasPermission('projects', ['edit']) && this.project.status != STATUS_ON_HOLD) {
      _buttons.push({
        text: this.translate.instant('mark_as_on_hold'),
        handler: () => {
          this.markAs(STATUS_ON_HOLD);
        }
      });
    }

    if (this.authService.hasPermission('projects', ['edit']) && this.project.status != STATUS_CANCELLED) {
      _buttons.push({
        text: this.translate.instant('mark_as_cancelled'),
        handler: () => {
          this.markAs(STATUS_CANCELLED);
        }
      });
    }

    if (this.authService.hasPermission('projects', ['edit']) && this.project.status != STATUS_FINISHED) {
      _buttons.push({
        text: this.translate.instant('mark_as_finished'),
        handler: () => {
          this.markAs(STATUS_FINISHED);
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
      text: this.translate.instant('copy_project'),
      handler: () => {
        this.copyProjectModalOpen();
      }
    },
      // {
      //   text: 'Invoice Project',
      //   handler: () => {
      //     // this.invoiceProject();
      //   }
      // }, 
      {
        text: this.translate.instant('_delete'),
        handler: () => {
          this.deleteProject();
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

  addAttachments(project_id) {
    this.projectApi.uploadFile(project_id, this.file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getFiles();
          this.file = null;
          this.mpcToast.show(response.message);
        } else {
          this.file = null;
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  async deleteFile(file_id, index) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.projectApi.deleteFile(file_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.files.splice(index, 1);
            this.getFiles();
            this.mpcToast.show(response.message);
          } else {
            this.mpcToast.show(response.message, 'danger');
          }
        }
      });
    }
  }

  onSelect(event) {
    if(event.rejectedFiles.length > 0){
      this.mpcToast.show(`You can't upload files of this type`, 'danger');
      return;
    }
    if (event.addedFiles.length > 0) {
      var fileSizeInBytes = event.addedFiles[0].size;
      var fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB

      if (fileSizeInMB > 2) {
        this.mpcToast.show('File size must be less than or equal to 2MB.', 'danger');
        return;
      } 
  }
    this.file = event.addedFiles[0];
    this.addAttachments(this.project_id);
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }

  async openFilters() {
    console.log('open Filters');
    if (this.selectedTab == 'project_tasks') {
      this.taskOpenFilters();
    } else if (this.selectedTab == 'project_estimates') {
      this.estimateOpenFilters();
    }
  }

  async estimateOpenFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: FiltersPage,
      componentProps: {
        appliedFilters: this.estimateAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.estimateAppliedFilters = modalFilters.data;

        if (this.estimateAppliedFilters.status.length !== 0 || this.estimateAppliedFilters.sale_agent !== null) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.estimate_offset = 0;
        this.estimates = [];
        this.getEstimates(true);
      }
    });
    return await modal.present();
  }

  async taskOpenFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: TaskFiltersPage,
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
        this.estimates = [];
        this.getEstimates(true);
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

  goToPage(page) {
    this.router.navigate([`${page}`]);
  }

  async editProject(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateProjectPage,
        mode: 'ios',
        componentProps: {
          projectId: id,
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
      this.router.navigate(['admin/projects/edit/', id]);
    }
  }
  
  visibleToCustomer(event, index, activity: any) {
    const status = activity.visible_to_customer == 0 ? 1 : 0;
    this.projectApi.visibleToCustomerStatus(activity.id, status).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.activities[index].visible_to_customer = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }, error: () => {}
    });
  }

  async copyProjectModalOpen(){
    const modal = await this.modalCtrl.create({
      component: CopyProjectPage,
      componentProps: {
        project: this.project
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
    });
    return await modal.present();
  }
  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('project_attachment', attachment_id).subscribe({
      next: async (response: any) => {
        const blobData = await this.blobToBase64(response);
        // console.log('blobData =>', blobData);
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
  searchStaffs(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.staffApi.get('', searchText, 0, 20, { active: '1' }).subscribe({
      next: (res: any) => {
        event.component.endSearch();
        if(res.status != false){
          event.component.items = res;
        }else{
          event.component.items = []
        }
      }, error: () => {
        event.component.endSearch();
      }
    });
  }
}
