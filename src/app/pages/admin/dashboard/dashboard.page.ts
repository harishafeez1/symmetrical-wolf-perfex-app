import { Component, ElementRef, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, LoadingController, ModalController } from '@ionic/angular';
import { EChartsOption } from 'echarts';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { PaymentHelper } from 'src/app/classes/payment-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DashboardApiService, STORAGE_DASHBOARD_KEY } from 'src/app/services/dashboard-api.service';
import { TodoApiService } from 'src/app/services/todo-api.service';
import { CreatePage } from '../todos/create/create.page';
import { GetResult, Preferences } from '@capacitor/preferences';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage.service';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPage implements OnInit {
  account_switched: EventListener;
  theme_changed: EventListener;
  primaryColor = getComputedStyle(document.querySelector('body[app-theme="' + document.body.getAttribute('app-theme') + '"')).getPropertyValue('--ion-color-primary');
  isDark = false;
  formGroup: FormGroup;
  isLoading = true;
  isTodoLoading = true;
  invoice_stats: any;

  total_invoices = 0;
  total_invoices_awaiting_payment = 0;
  invoice_progress = 0;

  total_leads = 0;
  total_leads_converted = 0;
  lead_progress = 0;

  total_projects = 0;
  total_projects_in_progress = 0;
  project_progress = 0;

  total_tasks = 0;
  total_not_finished_tasks = 0;
  percent_not_finished_tasks = 0;

  todo = [];
  todos_finished = [];

  finance_overview: any = [];

  chartOptions = this.paymentHelper.eChatOptions();
  invoiceStatusChartOptions = this.invoiceHelper.eChatOptions();
  chartMergeOptions: any = {};
  invoiceChartMergeOptions: any = {};

  filters: any;
  selectedCurrency = 'USD';

  authUser: any;

  constructor(
    public authService: AuthenticationService,
    private dashboardApi: DashboardApiService,
    private todoApi: TodoApiService,
    private invoiceApi: InvoiceApiService,
    private paymentHelper: PaymentHelper,
    private invoiceHelper: InvoicesHelper,
    private modalCtrl: ModalController,
    private loadingController: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private translate: TranslateService,
    private storage: StorageService
  ) {
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.toggleDarkTheme();
    });
    
  }
  ngOnInit() {
    this.toggleDarkTheme();
    // this.getDashboard();
    this.getFromStorage();

    this.authService.isAuthenticated.subscribe(async (loggedIn) => {
      if (this.authService.auth) {
        this.authUser = this.authService.auth?.data;
      }
    });

    this.theme_changed = () => {
      this.primaryColor = getComputedStyle(document.querySelector('body[app-theme="' + document.body.getAttribute('app-theme') + '"')).getPropertyValue('--ion-color-primary');
      console.log(this.primaryColor);
    };

    window.addEventListener("app:theme_changed", this.theme_changed);

    this.account_switched = () => {
      this.isLoading = true;
      this.getDashboard();
    };
    window.addEventListener("admin:account_switched", this.account_switched);
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
    window.removeEventListener("app:theme_changed", this.theme_changed);
  }
  async getFromStorage() {
    this.isLoading = true;
    const dashboard_storage_data = await this.storage.getObject(STORAGE_DASHBOARD_KEY);
    if (dashboard_storage_data == null) {
      this.getDashboard();
    } else {
      const response = dashboard_storage_data;
      if(response){
          this.invoice_stats = response.invoices.invoice_stats;
          this.selectedCurrency = this.invoice_stats.currency.symbol + ' ' + this.invoice_stats.currency.name;
          this.total_invoices = response.invoices.total_invoices;
          this.total_invoices_awaiting_payment = response.invoices.total_invoices_awaiting_payment;
          this.invoice_progress = response.invoices.percent_total_invoices_awaiting_payment;
    
          this.total_leads = response.leads.total_leads;
          this.total_leads_converted = response.leads.total_leads_converted;
          this.lead_progress = response.leads.percent_total_leads_converted;
    
          this.total_projects = response.projects.total_projects;
          this.total_projects_in_progress = response.projects.total_projects_in_progress;
          this.project_progress = response.projects.percent_in_progress_projects;
    
          this.total_tasks = response.tasks.total_tasks;
          this.total_not_finished_tasks = response.tasks.total_not_finished_tasks;
          this.percent_not_finished_tasks = response.tasks.percent_not_finished_tasks;
    
          this.finance_overview = response.finance_overview;
    
          this.invoiceChartMergeOptions = this.finance_overview?.invoices;
          this.chartMergeOptions = response.weekly_payment_stats;
    
          this.todo = response.todo;
          this.todo = this.todo.length ? this.todo.map(to => {
            return {...to , description: to.description.replaceAll('<br />', ' ') };
          } ): [];
          console.log('this.todo =>', this.todo);
          this.todos_finished = response.todos_finished;
          this.todos_finished = this.todos_finished.length ? this.todos_finished.map(to => {
            return {...to , description: to.description.replaceAll('<br />', ' ') };
          } ): [];
          this.filters = response.filters;
          this.getDashboard();
      }
      
    }
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

      this.invoiceChartMergeOptions.darkMode = this.isDark;
      if (this.isDark) {
        this.invoiceChartMergeOptions.yAxis = this.chartMergeOptions.yAxis = {
          splitLine: {
            lineStyle: {
              color: '#474D66'
            }
          }
        };
      } else {
        this.invoiceChartMergeOptions.yAxis = this.chartMergeOptions.yAxis = {
          splitLine: {
            lineStyle: {
              color: '#E9E9E9'
            }
          }
        };
      }
      console.log(this.invoiceChartMergeOptions);
    });
  }

  getDashboard(event: any = false) {
    this.authUser = this.authService.auth?.data;
    this.dashboardApi.get().subscribe({
      next: (response: any) => {
        if(response.status !== false){
          this.invoice_stats = response.invoices.invoice_stats;
          this.selectedCurrency = this.invoice_stats.currency.symbol + ' ' + this.invoice_stats.currency.name;
          this.total_invoices = response.invoices.total_invoices;
          this.total_invoices_awaiting_payment = response.invoices.total_invoices_awaiting_payment;
          this.invoice_progress = response.invoices.percent_total_invoices_awaiting_payment;
    
          this.total_leads = response.leads.total_leads;
          this.total_leads_converted = response.leads.total_leads_converted;
          this.lead_progress = response.leads.percent_total_leads_converted;
    
          this.total_projects = response.projects.total_projects;
          this.total_projects_in_progress = response.projects.total_projects_in_progress;
          this.project_progress = response.projects.percent_in_progress_projects;
    
          this.total_tasks = response.tasks.total_tasks;
          this.total_not_finished_tasks = response.tasks.total_not_finished_tasks;
          this.percent_not_finished_tasks = response.tasks.percent_not_finished_tasks;
    
          this.finance_overview = response.finance_overview;
    
          this.invoiceChartMergeOptions = this.finance_overview?.invoices;
          this.chartMergeOptions = response.weekly_payment_stats;
    
          this.todo = response.todo;
          this.todo = this.todo.length ? this.todo.map(to => {
            return {...to , description: to.description.replaceAll('<br />', ' ') };
          } ): [];
          console.log('this.todo =>', this.todo);
          this.todos_finished = response.todos_finished;
          this.todos_finished = this.todos_finished.length ? this.todos_finished.map(to => {
            return {...to , description: to.description.replaceAll('<br />', ' ') };
          } ): [];
          this.filters = response.filters;
    
          this.isLoading = false;
          this.isTodoLoading = false;
    
          if (event) {
            event.target.complete();
          }
        }
      }, error: () => {
        this.isLoading = false;
        this.isTodoLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  async addEditTodo(todo: any = null) {
    const modal = await this.modalCtrl.create({
      component: CreatePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        todo: todo
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.isTodoLoading = true;
        this.getDashboard();
      }
    });
    return await modal.present();
  }

  deleteTodo(id: any, index: any, type = 0) {
    this.todoApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          if (type == 0) {
            this.todo.splice(index, 1); //remove from list
          } else {
            this.todos_finished.splice(index, 1);
          }
        }
      }
    });
  }

  changeTodoStatus(todoid, status) {
    this.isTodoLoading = true;
    this.dashboardApi.changeTodoStatus(todoid, status).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getDashboard();
        }
      }
    });
  }

  openNotifications() {
    this.router.navigate(['admin/notifications']);
  }

  doRefresh(event: any) {
    this.getDashboard(event);
  }

  

  async changeCurrency() {
    const currencies = [];

    for (let currency of this.filters.invoices_total_currencies) {
      console.log(currency);
      currencies.push({
        text: currency.symbol + ' ' + currency.name,
        cssClass: 'action-sheet-line',
        data: {
          id: currency.id,
          name: currency.name,
          symbol: currency.symbol
        },
        role: (currency.name == this.selectedCurrency ? 'selected' : '')
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      mode: 'ios',
      buttons: [
        ...currencies,
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    console.log

    if (result?.data?.id) {
      this.isLoading = true;
      this.invoiceApi.getInvoicesTotal({ currency: result?.data?.id, init_total: true }).subscribe({
        next: (response: any) => {
          console.log(response);
          this.isLoading = false;
          this.invoice_stats = response.invoices.invoice_stats;
          this.selectedCurrency = result?.data?.symbol + ' ' + result?.data?.name;
        }, error: () => {this.isLoading = false}
      });
    }

    console.log(JSON.stringify(result, null, 2));
  }

  openStaff() {
    const extras: NavigationExtras = {
      state: this.authUser
    };
    this.router.navigate(['admin/staffs/view/', this.authUser?.staffid], extras);
  } 
}
