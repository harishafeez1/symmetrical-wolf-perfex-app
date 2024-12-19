import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { CommonApiService } from 'src/app/services/common-api.service';
import { format, parseISO } from 'date-fns';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { ExpenseApiService } from 'src/app/services/expense-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewExpensePage } from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit, OnDestroy {
  @Input() expenseId: any;
  @Input() type: any;
  expense_id = this.activatedRoute.snapshot.paramMap.get('id');
  file: File;
  formGroup: UntypedFormGroup;
  selectedTab = 'expense_details';
  currencies: any;
  expense_categories: any;

  selectedCurrency: any;
  expense: any;
  isLoading = true;
  submitting = false;
  customers = [];
  projects = [];
  payment_modes = [];
  taxes =  [{
    id: "",
    name: this.translate.instant('no_tax'),
    taxrate: ""
  }];
  private currency$: Subscription;
  isDateModalOpen = false;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private customerApi: CustomerApiService,
    private currencyApi: CurrencyApiService,
    private expenseApi: ExpenseApiService,
    private commonApi: CommonApiService,
    private projectApi: ProjectApiService,
    private modalCtrl: ModalController,
    private settingHelper: SettingsHelper,
    private dateTimePipe: DateTimePipe,
    private router: Router,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {
  }

  getExpense() {
    if (this.expense_id) {
      this.isLoading = true;
      this.expenseApi.get(this.expense_id).subscribe({
        next: (res: any) => {
          console.log(res);
          this.expense = res;
          this.formGroup.patchValue({
            expense_name: this.expense.expense_name,
            note: this.expense.note ? this.expense.note.replaceAll('<br />', '') : '',
            date: this.expense.date ? this.dateTimePipe.transform(this.expense.date) : '',
            amount: this.expense.amount,
            reference_no: this.expense.reference_no,
            repeat_every: this.expense.custom_recurring == 1 ? 'custom' : (this.expense.repeat_every == 0 || this.expense.repeat_every == null ? '' : this.expense.repeat_every + '-' + this.expense.recurring_type),
            create_invoice_billable: this.expense.create_invoice_billable == '1' ? true : false,
            send_invoice_to_customer: this.expense.send_invoice_to_customer == '1' ? true : false,
            repeat_every_custom: this.expense.custom_recurring == 1 ? this.expense.repeat_every : '',
            repeat_type_custom: this.expense.custom_recurring == 1 ? this.expense.recurring_type : '',
            cycles: this.expense.cycles,
            billable: this.expense.billable == '1' ? true : false
          });
  
          if (this.expense.cycles != 0) {
            this.formGroup.controls.cycles.enable();
          }
  
          this.loadApiData();
          this.isLoading = false;
        }, error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadApiData();
    }
  }

  loadApiData() {
    this.currency$ = this.currencyApi.getCurrenciesData().subscribe(async res => {
      if (!res) {
        this.currencyApi.get().subscribe({
          next: response => {
            this.currencyApi.setCurrenciesData(response);
          }
        });
      } else {
        this.currencies = await res;
        for (let currency of this.currencies) {
          if (currency.isdefault == 1) {
            this.selectedCurrency = currency.id;
            this.formGroup.controls.currency.setValue(currency.id);
            break;
          }
        }

        if (this.expense) {
          this.formGroup.controls.currency.setValue(this.expense.currency);
        }
      }
    })

    this.commonApi.expense_category().subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.expense_categories = response;
  
          if (this.expense) {
            this.formGroup.controls.category.setValue(this.expense.category);
          }
        }
  
      }
    });

    this.commonApi.tax_data().subscribe({
      next: (response: any) => {
        if(response.status !== false){
          this.taxes.push(...response);
        }
  
        if (this.expense) {
          const tax = {
            id: this.expense.tax,
            name: this.expense.tax_name,
            taxrate: this.expense.taxrate
          };
  
          const tax2 ={
            id: this.expense.tax2,
            name: this.expense.tax_name2,
            taxrate: this.expense.taxrate2
          };
          if (this.expense.tax != 0) {
            this.formGroup.controls.tax.setValue(tax);
          }else{
            this.formGroup.controls.tax.setValue(this.taxes[0]);
          }
  
          if (this.expense.tax2 != 0) {
            this.formGroup.controls.tax2.setValue(tax2);
          }else{
            this.formGroup.controls.tax2.setValue(this.taxes[0]);
          }
        }else{
            this.formGroup.controls.tax.setValue(this.taxes[0]);
            this.formGroup.controls.tax2.setValue(this.taxes[0]);
  
        }
      }
    });

    this.commonApi.payment_mode().subscribe({
      next: (response:any) => {
        if(response.status !== false){
          this.payment_modes = response;
        }
  
        if (this.expense) {
          this.formGroup.controls.paymentmode.setValue(this.expense.paymentmode);
        }
      }
    });

    this.getCustomers();
  }

  ngOnInit() {
    this.expense_id = this.expense_id ?? this.expenseId;
    this.getExpense();

    this.formGroup = this.fb.group({
      expense_name: [''],
      note: [''],
      category: ['', [Validators.required]],
      date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      amount: ['', [Validators.required]],
      clientid: [''],
      project_id: [''],
      billable: [false],
      currency: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      tax: [''],
      tax2: [''],
      paymentmode: [''],
      reference_no: [''],
      repeat_every: [''],
      create_invoice_billable: [false],
      send_invoice_to_customer: [false],
      repeat_every_custom: [''],
      repeat_type_custom: ['day'],
      cycles: [{
        value: 0,
        disabled: true
      }],
      custom_fields: this.fb.group({
        expenses: this.fb.group([])
      })
    });

    this.settingHelper.settings.subscribe(() => {
      if (!this.expense) {
        this.formGroup.patchValue({
          date: this.dateTimePipe.transform(new Date())
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.currency$.unsubscribe();
  }

  get cycles() {
    return this.formGroup.get('cycles');
  }

  get repeat_every() {
    return this.formGroup.get('repeat_every');
  }

  unlimitedCycleChange(event: any) {
    console.log(event);
    if (event.detail.checked) {
      this.formGroup.controls.cycles.setValue(0);
      this.formGroup.controls.cycles.disable();
    } else {
      this.formGroup.controls.cycles.enable();
    }
  }

  getProjects(event: any = false, projectChanging = true) {
    this.formGroup.controls.project_id.reset();

    this.projectApi.get('', '', null, null, {
      clientid: event.value.userid
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
          if (this.expense?.project_data?.name && projectChanging === true) {
            this.formGroup.controls.project_id.setValue({
              id: this.expense.project_data.id,
              name: this.expense.project_data.name
            });
          }
        }
      }
    });
  }

  getCustomers() {
    this.customerApi.get('', '', null, null,{active: '1'}).subscribe({
      next: (res: any) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.expense && this.expense.clientid != 0) {
          this.formGroup.controls.clientid.setValue({
            userid: this.expense.clientid,
            company: this.expense.company
          });
  
          this.projects = [];
          const __event = {
            value: {
              userid: this.expense.clientid
            }
          };
          this.getProjects(__event);
        }
  
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false; 
      }
    });
  }

  customerSelect(event: any) {
    console.log(event);
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
    this.formGroup.patchValue({
      currency: (!event.value.default_currency || event.value.default_currency == '0') ? defaultCurrency.id : event.value.default_currency
    });
    this.projects = [];
    this.getProjects(event, false);
  }

  onSelect(event) {
    console.log(event);
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

    if (this.expense?.attachment) {
      this.deleteExpenseAttachment(this.expense_id);
    }

    this.file = event.addedFiles[0];
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  updateExpense() {
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
    const selectCustomer = (this.formGroup.value.clientid && this.customers.length) ? this.customers.find(customer => customer.userid == this.formGroup.value.clientid.userid) : {};
    this.formGroup.value.currency = (!selectCustomer.default_currency || selectCustomer.default_currency == '0') ? defaultCurrency.id : selectCustomer.default_currency;
    // this.formGroup.value.currency = this.selectedCurrency;
    this.formGroup.value.billable = this.formGroup.value.billable === true ? 1 : 0;
    this.formGroup.value.amount = this.formGroup.value.amount ? Number(this.formGroup.value.amount).toFixed(2) : 0.00;
    this.submitting = true;
    this.expenseApi.update(this.expense_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          if (this.file == null) {
            if (this.type !== 'modal') {
              // this.nav.navigateRoot('/admin/expenses/view/' + this.expense_id);
              this.router.navigate(['/admin/expenses/view/', this.expense_id]);
            } else {
              this._openExpenseViewModal(this.expense_id);
            }
          } else {
            this.addAttachments(this.expense_id);
          }
        } else {
          if (this.file != null) {
            this.addAttachments(this.expense_id);
          }
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false; 
      }
    });
  }

  createExpense() {
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
    const selectCustomer = this.formGroup.value.clientid ?? {};
    // this.formGroup.value.currency = this.selectedCurrency;
    this.formGroup.value.currency = (!selectCustomer.default_currency || selectCustomer.default_currency == '0') ? defaultCurrency.id : selectCustomer.default_currency;
    this.formGroup.value.billable = this.formGroup.value.billable === true ? 1 : 0;
    this.submitting = true;
    this.expenseApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
  
          this.mpcToast.show(res.message);
  
          if (this.file == null) {
            if (this.type !== 'modal') {
              // this.nav.navigateRoot('/admin/expenses/view/' + res.insert_id);
              this.router.navigate(['/admin/expenses/view/', res.insert_id]);
            } else {
              this._openExpenseViewModal(res.insert_id);
            }
          } else {
            this.addAttachments(res.insert_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  addAttachments(id) {
    this.expenseApi.addAttachment(id, this.file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/expenses/view/', id]);
          } else {
            this._openExpenseViewModal(id);
          }
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  deleteExpenseAttachment(expense_id) {
    this.expenseApi.deleteAttachment(expense_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getExpense();
          this.mpcToast.show(response.message);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }

  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }

  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role)
  }
  async _openExpenseViewModal(expenseId: any) {
    this.close(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewExpensePage,
      mode: 'ios',
      componentProps: {
        expenseId: expenseId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if (modalFilters.data) {

      }
    });
    return await modal.present();
  }
  searchCustomers(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.customerApi.get('', searchText, 0, 20, { active: '1' }).subscribe({
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
  searchProjects(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.projectApi.get('', searchText, 0, 20).subscribe({
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
