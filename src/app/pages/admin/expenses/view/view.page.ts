import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { ExpenseApiService } from 'src/app/services/expense-api.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { Browser } from '@capacitor/browser';
import { StorageService } from 'src/app/services/storage.service';
import { BASE_URL_KEY } from 'src/app/guards/base-url.guard';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { FiltersPage as TaskFiltersPage } from '../../tasks/modals/filters/filters.page';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateExpensePage } from 'src/app/pages/admin/expenses/create/create.page';
import { Subscription } from 'rxjs';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { ConvertToInvoicePage } from '../modals/convert-to-invoice/convert-to-invoice.page';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  @Input() expenseId: any;
  @Input() type = '';
  @Input() expenseInfo: any;
  expense_id = this.activatedRoute.snapshot.paramMap.get('id');
  selectedTab = 'expense';
  expense: any;
  countries = [];
  currencies = [];
  isLoading = true;
  isSearching = false;

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    rel_id: this.expense_id,
    rel_type: 'expense',
    status: [],
    assigned: []
  };

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;
  totalAmountTaxes: any;

  private country$: Subscription;
  private currency$: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private expenseApi: ExpenseApiService,
    public taskApi: TaskApiService,
    private reminderApi: ReminderApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private downloadApi: DownloadApiService,
    public taskHelper: TasksHelper,
    private mpcToast: MpcToastService,
    public authService: AuthenticationService,
    private modalCtrl: ModalController,
    private sharedService: SharedService,
    private animationService: AnimationService,
  ) {

  }

  ngOnInit() {
    this.expense_id = this.expense_id ?? this.expenseId;
    this.taskAppliedFilters.rel_id = this.expense_id;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.expense = this.router.getCurrentNavigation().extras.state;
        console.log('this.expense data =>', this.expense);
        this.isLoading = false;
        if (this.expense) {
          this.totalAmountTaxes = this.totalAmountWithTax(this.expense.amount, this.expense.taxrate, this.expense.taxrate2);
        }
      } else {
        if (this.type === 'modal' && this.expenseInfo) {
          this.expense = this.expenseInfo;
          this.isLoading = false;
          if (this.expense) {
            this.totalAmountTaxes = this.totalAmountWithTax(this.expense.amount, this.expense.taxrate, this.expense.taxrate2);
          }
        } else {
          this.getExpense();
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

  async downloadExpenseAttachment() {
    await Browser.open({ url: this.authService.BASE_URL + '/download/file/expense/' + this.expense_id });
  }

  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('expense', attachment_id).subscribe({
      next: async (response: any) => {
        // const pdfBlob = new Blob([response], { type: filetype });
        const blobData = await this.blobToBase64(response);
  
        try {
          // Write the base64-encoded string to a file in the Documents directory
          const savedFile = await Filesystem.writeFile({
            path: filename,
            data: blobData,
            directory: Directory.Documents,
          });
  
          // Open the files        using the FileOpener plugin
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
  getExpense(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = true;
    this.expenseApi.get(this.expense_id).subscribe({
      next: (res) => {
        this.expense = res;
        this.expense.decimal_separator = this.expense.currency_data ? this.expense.currency_data.decimal_separator : '';
        this.expense.thousand_separator = this.expense.currency_data ? this.expense.currency_data.thousand_separator : '';
        this.expense.symbol = this.expense.currency_data ? this.expense.currency_data.symbol : '';
        this.expense.placement = this.expense.currency_data ? this.expense.currency_data.placement : '';
        if (this.expense) {
          this.totalAmountTaxes = this.totalAmountWithTax(this.expense.amount, this.expense.taxrate, this.expense.taxrate2);
        }
        this.sharedService.dispatchEvent({
          event: 'admin:get_expense',
          data: this.expense
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

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.expense_id, 'expense', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
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
      }, error: () =>{
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

  async addTask() {
    /*     const extras: NavigationExtras = {
          state: {
            rel_type: 'expense',
            rel_name: this.expense.name,
            relational_values: {
              addedfrom: "1",
              id: this.expense.id,
              name: `${this.expense.name} (${this.expense.expense_name})`,
              subtext: '',
              type: 'expense'
            },
            rel_id: this.expense_id
          }
        };
        this.router.navigate(['admin/tasks/create'], extras); */
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'expense',
          rel_name: this.expense.name,
          relational_values: {
            addedfrom: "1",
            id: this.expense.id,
            name: `${this.expense.name} (${this.expense.expense_name})`,
            subtext: '',
            type: 'expense'
          },
          rel_id: this.expense_id
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
        rel_type: 'expense',
        rel_id: this.expense_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getExpense();
        this.getReminders();
      }
    });
    return await modal.present();
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

  loadMoreReminders(event) {
    this.reminder_offset += this.reminder_limit;
    console.log('offset:', this.reminder_offset);
    this.getReminders(false, event, false);
  }

  loadMoreTasks(event) {
    this.task_offset += this.task_limit;
    console.log('offset:', this.task_offset);
    this.getTasks(false, event, false);
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

  doExpenseRefresh(event: any, tab = '') {
    this.getExpense(true, event);
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

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }
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

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  copyExpense() {
    this.expenseApi.copy(this.expense_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_updated'));
          this.router.navigate(['/admin/expenses/edit/' + response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  async openFilters() {
    console.log('open Filters');
    console.log('this.taskAppliedFilters =>', this.taskAppliedFilters);
    const modal = await this.modalCtrl.create({
      component: TaskFiltersPage,
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters: any) => {
      console.log('modalFilters =>', modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.taskAppliedFilters = modalFilters.data;
        console.log('this.taskAppliedFilters 12 =>', this.taskAppliedFilters);

        if (this.taskAppliedFilters.status.length !== 0 || this.taskAppliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        // console.log('Modal Sent Data : ', modalFilters.data);

        this.task_offset = 0;
        this.tasks = [];
        this.getTasks(true);
      }
    });
    return await modal.present();

  }

  totalAmountWithTax(amount, tax1, tax2) {
    // console.log('amount =>', amount, parseFloat(amount));
    if (!amount) {
      return 0;
    }
    const total = parseFloat(amount);
    const tax1Amount = (tax1 && parseFloat(tax1) != 0) ? (total / 100) * (parseFloat(tax1)) : 0;
    const tax2Amount = (tax2 && parseFloat(tax2) != 0) ? (total / 100) * (parseFloat(tax2)) : 0;
    const totalAmount = total + (tax1Amount) + (tax2Amount);
    return totalAmount;
  }

  reminderRefresh(event) {
    if (event) {
      this.getReminders();
    }
  }

  goToPage(page) {
    this.router.navigate([`${page}`]);
  }
  
  async editExpense(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateExpensePage,
        mode: 'ios',
        componentProps: {
          expenseId: id,
          type: 'modal'
        }
      });
      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['admin/expenses/edit/', id]);
    }
  }
  async convertToInvoice(){
    const modal = await this.modalCtrl.create({
      component: ConvertToInvoicePage,
      componentProps: {
        expense_id: this.expense_id
      }
    });

    modal.onDidDismiss().then((modalFilters: any) => {
      console.log('modalFilters =>', modalFilters);
      if (modalFilters.data) {
 
      }
    });
    return await modal.present();
  }
}
