import { Component, Input, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonInput, IonRouterOutlet, ModalController, NavController, ToastController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { ItemApiService } from 'src/app/services/item-api.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { Customer } from 'src/app/interfaces/customer';
import { InvoiceItem } from 'src/app/interfaces/invoice-item';
import { Invoice } from 'src/app/interfaces/invoice';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { STATUS_DRAFT } from 'src/app/classes/invoices-helper';
import { ViewPage as ViewInvoicePage } from '../../invoices/view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { Subscription } from 'rxjs';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit,OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  @Input() proposal: any;
  @Input() estimate: any;
  @Input() type = '';
  @Input() invoiceId: any;
  @Input() extraInfo: any;

  STATUS_DRAFT = STATUS_DRAFT;

  invoice_id = this.activatedRoute.snapshot.paramMap.get('id');

  settings: any;
  customers: Customer[] = [];
  customer: Customer;
  isLoading = true;
  drafting = false;
  submitting = false;
  projects = [];

  offset = 0;
  limit = 20;

  formGroup: UntypedFormGroup;
  selectedTab = 'customer_details';
  countries: any;
  currencies: any;
  payment_modes: any;
  staffs: any;
  items: InvoiceItem[];
  taxes = [];
  // selectedCurrency: any;
  invoiceRecurringValue = 0;
  selectedItemTaxRate: any;
  selectedItem: InvoiceItem = {
    description: '',
    long_description: '',
    qty: 1,
    rate: 0,
    taxrate: [],
    unit: ''
  };
  invoiceItems: InvoiceItem[] = [];

  subTotal = 0;
  total = 0;
  totalTaxes: any[] = [];
  discount = 0;
  total_discount = 0;
  invoice: Invoice;

  isPopoverOpen = false;
  selected_dicount_type = 'discount-type-percent';
  private country$: Subscription;
  private currency$: Subscription;
  @ViewChild('myInput') myInput: IonInput | undefined;
  tags: any[] = [];
  isDueDateModalOpen = false;
  isInvoiceDateModalOpen = false;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private invoiceApi: InvoiceApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private customerApi: CustomerApiService,
    private projectApi: ProjectApiService,
    private commonApi: CommonApiService,
    private staffApi: StaffApiService,
    private itemApi: ItemApiService,
    private proposalApi: ProposalApiService,
    private estimateApi: EstimateApiService,
    private settingHelper: SettingsHelper,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private router: Router,
    private animationService: AnimationService, 
  ) {

  }
  ngOnInit() {
    this.invoice_id = this.invoice_id ?? this.invoiceId;

    console.log(this.settings);
    this.getInvoice();

    this.formGroup = this.fb.group({
      clientid: ['', [Validators.required]],
      project_id: [''],
      number: [this.settings?.next_invoice_number, [Validators.required]],
      date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      // format(new Date(), 'yyyy-MM-dd')
      duedate: [''],
      cancel_overdue_reminders: [false],
      allowed_payment_modes: ['', [Validators.required]],
      currency: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      sale_agent: [''],

      recurring: [0],
      repeat_every_custom: [''],
      repeat_type_custom: ['day'],
      cycles: [{
        value: 0,
        disabled: true
      }],

      discount_type: [''],
      adminnote: [''],

      select_item: [''],
      task_select: [''],
      show_quantity_as: ["1"],
      adjustment: [0],

      clientnote: [this.settings?.predefined_clientnote_invoice],
      terms: [this.settings?.predefined_terms_invoice],

      billing_street: [''],
      billing_city: [''],
      billing_state: [''],
      billing_zip: [''],
      billing_country: [''],

      include_shipping: [false],
      show_shipping_on_invoice: [false],
      shipping_street: [''],
      shipping_city: [''],
      shipping_state: [''],
      shipping_zip: [''],
      shipping_country: [''],
      removed_items: [],

      custom_fields: this.fb.group({
        invoice: this.fb.group([])
      })
    });
/*     if(this.type === 'modal' && this.extraInfo){
      this.formGroup.patchValue({
        clientid: this.extraInfo.rel_id
      });
    } */
    this.settingHelper.settings.subscribe(response => {
      this.settings = response;
      if (!this.invoice) {
        this.formGroup.patchValue({
          date: this.dateTimePipe.transform(new Date()),
          number: this.settings?.next_invoice_number
        });
      }
    });
    console.log(this.proposal);
  }
  ngOnDestroy(): void {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  getInvoice() {
    if (this.invoice_id) {
      this.isLoading = true;
      this.invoiceApi.get(this.invoice_id).subscribe({
        next: (res: any) => {
          this.invoice = res;
  
          this.formGroup.patchValue({
            number: (this.STATUS_DRAFT == this.invoice.status ? 'DRAFT' : this.invoice.number),
            date: this.dateTimePipe.transform(this.invoice.date),
            duedate: this.dateTimePipe.transform(this.invoice.duedate),
            cancel_overdue_reminders: (this.invoice.cancel_overdue_reminders == 0 ? false : true),
            adminnote: this.invoice.adminnote ? this.invoice.adminnote.replace(new RegExp('<br />', 'g'), '') : '',
            recurring: this.invoice.recurring ? Number(this.invoice.recurring) : 0,
  
            repeat_every_custom: this.invoice.repeat_every_custom,
            repeat_type_custom: this.invoice.repeat_type_custom,
            cycles: this.invoice.cycles,
            show_quantity_as: this.invoice.show_quantity_as,
            discount_type: this.invoice.discount_type,
  
            clientnote: this.invoice.clientnote ? this.invoice.clientnote.replace(new RegExp('<br />', 'g'), '') : '',
            terms: this.invoice.terms ? this.invoice.terms.replace(new RegExp('<br />', 'g'), '') : '',
  
            billing_street: this.invoice.billing_street ? this.invoice.billing_street.replace(new RegExp('<br />', 'g'), '') : '',
            billing_city: this.invoice.billing_city,
            billing_state: this.invoice.billing_state,
            billing_zip: this.invoice.billing_zip,
  
            include_shipping: this.invoice.include_shipping == 0 ? false : true,
            show_shipping_on_invoice: this.invoice.show_shipping_on_invoice == 0 ? false : true,
            shipping_street: this.invoice.shipping_street ? this.invoice.shipping_street.replace(new RegExp('<br />', 'g'), '') : '',
            shipping_city: this.invoice.shipping_city,
            shipping_state: this.invoice.shipping_state,
            shipping_zip: this.invoice.shipping_zip
          });
  
          if (this.STATUS_DRAFT == this.invoice.status) {
            this.formGroup.controls.number.disable();
          } else {
            this.formGroup.controls.number.enable();
          }
  
          if (this.invoice.cycles != 0) {
            this.formGroup.controls.cycles.enable();
          }
  
          this.discount = this.invoice.discount_percent != 0 ? this.invoice.discount_percent : this.invoice.discount_total;
          this.selected_dicount_type = this.invoice.discount_percent != 0 ? 'discount-type-percent' : 'discount-type-fixed';
          this.tags = (this.invoice.tags && this.invoice.tags.length) ? this.invoice.tags.split(',') : []
  
          this.loadApiData();
        }, error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadApiData();
    }
  }

  customerChange(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    console.log('customer:', event.value);
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
            this.formGroup.controls.currency.setValue(currency.id);
            break;
          }
        }
  
        if(this.invoice) {
          this.formGroup.controls.currency.setValue(this.invoice.currency);
        }
      }
    })
    this.country$ = this.countryApi.getCountriesData().subscribe(async res => {
      if (!res) {
        this.countryApi.get().subscribe({
          next: response => {
            this.countryApi.setCountriesData(response);
          }
        });
      } else {
        this.countries = await res;
        if (this.invoice) {
          this.formGroup.controls.billing_country.setValue(this.invoice.billing_country);
          this.formGroup.controls.shipping_country.setValue(this.invoice.shipping_country);
        }
      }
    })

    this.commonApi.payment_mode().subscribe({
      next: response => {
        this.payment_modes = response;
  
        if (this.invoice) {
          if (typeof this.invoice.allowed_payment_modes === 'string' || this.invoice.allowed_payment_modes instanceof String) {
            const p_mode_ids = this.invoice.allowed_payment_modes.split(',');
            this.formGroup.controls.allowed_payment_modes.setValue(p_mode_ids);
          } else {
            this.formGroup.controls.allowed_payment_modes.setValue(this.invoice.allowed_payment_modes);
          }
        } else {
          const p_mode_ids = [];
  
          for (let payment_mode of this.payment_modes) {
            p_mode_ids.push(payment_mode.id);
          }
  
          this.formGroup.controls.allowed_payment_modes.setValue(p_mode_ids);
          console.log('this.formGroup.value.allowed_payment_modes =>', this.formGroup.value.allowed_payment_modes);
        }
      }
    });

    this.commonApi.tax_data().subscribe({
      next: (response: any) => {
        this.taxes = [];
        if (response.status !== false) {
          for (let tax of response) {
            this.taxes.push({
              name: tax.name,
              taxrate: tax.taxrate
            });
          }
        }
  
        const removed_items = [];
  
        if (this.invoice) {
          for (let item of this.invoice.items) {
            removed_items.push(item.id);
          }
  
          this.invoiceItems = this.invoice.items;
          this.formGroup.controls.adjustment.setValue(this.invoice.adjustment);
          this.subTotal = parseFloat(this.invoice.subtotal);
          this.total = parseFloat(this.invoice.total);
        } else if (this.proposal) {
          for (let item of this.proposal.items) {
            removed_items.push(item.id);
          }
  
          this.invoiceItems = this.proposal.items;
          this.formGroup.controls.adjustment.setValue(this.proposal.adjustment);
          this.subTotal = parseFloat(this.proposal.subtotal);
          this.total = parseFloat(this.proposal.total);
        }
  
        this.formGroup.controls.removed_items.setValue(removed_items);
      }
    });

    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
        if (this.invoice) {
          this.formGroup.controls.sale_agent.setValue(this.invoice.sale_agent);
        }
      }
    });

    this.itemApi.get().subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.items = response;
        }
      }
    });

    this.getCustomers();
  }

  get clientid() {
    return this.formGroup.get('clientid');
  }

  get cycles() {
    return this.formGroup.get('cycles');
  }

  get recurring() {
    return this.formGroup.get('recurring');
  }

  get adjustment() {
    return this.formGroup.get('adjustment');
  }

  get include_shipping() {
    return this.formGroup.get('include_shipping');
  }

  customerSelect(event: any) {
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
    this.formGroup.patchValue({
      billing_street: event.value.billing_street,
      billing_city: event.value.billing_city,
      billing_state: event.value.billing_state,
      billing_zip: event.value.billing_zip,
      billing_country: event.value.billing_country,

      shipping_street: event.value.shipping_street,
      shipping_city: event.value.shipping_city,
      shipping_state: event.value.shipping_state,
      shipping_zip: event.value.shipping_zip,
      shipping_country: event.value.shipping_country,
      
      currency: (!event.value.default_currency || event.value.default_currency == '0') ?  defaultCurrency.id : event.value.default_currency
    });

    
    this.projects = [];
    this.getProjects(event, false);
  }
  addTag(input: IonInput) {
    const value =  input.value;
    if (value && this.tags.indexOf(value) === -1) {
      this.tags.push(value);
      input.value = '';// Clear the input after adding tag
    }
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }

  getProjects(event: any = false, projectChanging = true) {
    this.formGroup.controls.project_id.reset();

    this.projectApi.get('', '', null, null, {
      clientid: event.value.userid
    }).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.projects.push(...response);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
          if (this.invoice?.project_data && projectChanging === true) {
            this.formGroup.controls.project_id.setValue({
              id: this.invoice.project_data?.id,
              name: this.invoice.project_data?.name
            });
          }
        }
  
        // if(event && res.length !== this.limit) {
        //   event.component.disableInfiniteScroll();
        // }
  
        // if(event) {
        //   event.component.items = this.projects;
        //   event.component.endInfiniteScroll();
        // }
      }
    });
  }

  getCustomers(event: any = false) {
    this.customerApi.get('', '', this.offset, this.limit, {active: '1'}).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.invoice) {
          this.invoice.client.symbol = this.invoice.symbol;
          this.invoice.client.decimal_separator = this.invoice.decimal_separator;
          this.invoice.client.thousand_separator = this.invoice.thousand_separator;
          this.formGroup.controls.clientid.setValue(this.invoice.client);
  
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.invoice.client.userid
              }
            };
            this.getProjects(__event);
          }
        } else if (this.proposal) {
          this.formGroup.controls.clientid.setValue(this.proposal.client);
  
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.proposal.client.userid
              }
            };
            this.getProjects(__event);
          }
        } else if (this.extraInfo){
          this.formGroup.controls.clientid.setValue(this.extraInfo.client);
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.extraInfo.client.userid
              }
            };
            this.getProjects(__event);
          }
  
        }
  
        if (event && res.length !== this.limit) {
          event.component.disableInfiniteScroll();
        }
  
        if (event) {
          event.component.items = this.customers;
          event.component.endInfiniteScroll();
        }
  
        this.isLoading = false;
      }, error: () => {
        if (event) {
          event.component.items = this.customers;
          event.component.endInfiniteScroll();
        }
  
        this.isLoading = false;
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  createInvoice(save = '') {
    console.log('this.formGroup =>', this.formGroup.value);
    console.log('this.formGroup.getRawValue() =>', this.formGroup.getRawValue());
    // return;
    if (this.invoiceItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the invoice', 'danger');
      return false;
    }
    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total =  Number(this.total_discount) > 0 ? Number(this.total_discount).toFixed(2) : 0.00;
    getRawValue.tags = this.tags.length ?  this.tags.toString() : '';

    this.drafting = false;
    this.submitting = true;
    if (save == 'save_as_draft') {
      getRawValue.save_as_draft = true;
      this.drafting = true;
      this.submitting = false;
    }

    if (this.proposal) {
      this.proposalApi.convertToInvoice(this.proposal.id, getRawValue, this.invoiceItems).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.mpcToast.show(res.message);
            window.dispatchEvent(new CustomEvent('admin:invoice_created'));
            this.router.navigate(['/admin/invoices/view/', res.insert_id]);
            this.modalCtrl.dismiss();
          } else {
            this.mpcToast.show(res.message, 'danger');
          }
  
          this.drafting = false;
          this.submitting = false;
        }, error: () => {
          this.drafting = false;
          this.submitting = false;
        }
      });
      return;
    }


    this.invoiceApi.store(getRawValue, this.invoiceItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_created'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/invoices/view/', res.insert_id]);
          } else {
            this.close();
            this._openInvoiceViewModal(res.insert_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
  
        this.drafting = false;
        this.submitting = false;
      }, error: () => {
        this.drafting = false;
        this.submitting = false;
      }
    });
  }

  updateInvoice() {

    if (this.invoiceItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the invoice', 'danger');
      return false;
    }
    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = Number(this.total_discount) > 0 ? Number(this.total_discount).toFixed(2) : 0.00;
    getRawValue.tags = this.tags.length ?  this.tags.toString() : '';

    if (this.invoice.status == this.STATUS_DRAFT) {
      getRawValue.number = this.invoice.number;
    }

    this.submitting = true;
    this.invoiceApi.update(this.invoice_id, getRawValue, this.invoiceItems).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:invoice_updated'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/invoices/view/', this.invoice_id]);
          } else {
            this.close();
            this._openInvoiceViewModal(this.invoice_id);
          }
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
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

  formatDate(value: any, type = 'date') {
    return this.dateTimePipe.transform(value, type);
  }

  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }

  itemSelect(event: any) {
    console.log(event);
    if (event.value != null) {
      this.selectedItem.description = event.value.name;
      this.selectedItem.unit = event.value?.unit;
      this.selectedItem.rate = parseInt(event.value.rate);

      this.selectedItem.taxrate = [];
      if (event.value?.tax_id_1) {
        this.selectedItem.taxrate.push({
          id: event.value.tax_id_1,
          name: event.value.taxname_1,
          taxrate: event.value.taxrate_1
        });
      } else if (event.value?.tax_id_2) {
        this.selectedItem.taxrate.push({
          id: event.value.tax_id_2,
          name: event.value.taxname_2,
          taxrate: event.value.taxrate_2
        });
      }
    }
  }

  addItemToInvoice() {
    if (this.selectedItem.description == '') {
      return false;
    }

    console.log(this.formGroup.value);
    const newItem = {
      description: this.selectedItem.description,
      long_description: this.selectedItem.long_description,
      qty: this.selectedItem.qty,
      rate: this.selectedItem.rate,
      taxrate: this.selectedItem.taxrate,
      unit: this.selectedItem.unit
    };
    this.invoiceItems.push(newItem);
    this.formGroup.controls.select_item.reset();
    this.selectedItem = {
      description: '',
      long_description: '',
      qty: 1,
      rate: 0,
      taxrate: [],
      unit: ''
    }
    console.log(newItem);
    this.calculateInvoice();
  }

  calculateInvoice() {
    this.subTotal = 0;
    this.total = 0;
    this.totalTaxes = [];
    this.invoiceItems.forEach((item) => {
      this.subTotal += (item.rate * item.qty);
      this.total += (item.rate * item.qty);
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
          this.total += (((item.rate * item.qty) / 100) * tax.taxrate);
        }

      }
    });

    this.total_discount = 0;
    if (this.formGroup.value.discount_type == 'before_tax') {
      console.log(this.selected_dicount_type);
      if (this.selected_dicount_type == 'discount-type-percent') {
        this.total_discount = ((this.subTotal / 100) * this.discount);
      }

      if (this.selected_dicount_type == 'discount-type-fixed') {
        this.total_discount = this.discount;
      }
    }

    if (this.formGroup.value.discount_type == 'after_tax') {
      if (this.selected_dicount_type == 'discount-type-percent') {
        this.total_discount = ((this.total / 100) * this.discount);
      }

      if (this.selected_dicount_type == 'discount-type-fixed') {
        this.total_discount = this.discount;
      }
    }

    this.total -= this.total_discount;
    this.total += parseFloat(this.formGroup.value.adjustment);
    console.log(this.totalTaxes);
    console.log(this.total_discount);
  }

  changeDiscountType(discount_type) {
    this.selected_dicount_type = discount_type;
    this.calculateInvoice();
  }

  removeItemToInvoice(index: any) {
    this.invoiceItems.splice(index, 1);
    this.calculateInvoice();
    console.log(index, this.invoiceItems);
  }

  addDiscount() {
    if (this.discount != 0 && this.formGroup.value.discount_type == '') {
      this.mpcToast.show('You need to select discount type', 'danger');
      this.content.scrollToPoint(0, 300, 400);
      this.formGroup.get('discount_type').setValidators(Validators.required);
      this.formGroup.get('discount_type').setErrors({ invalid: true });
      this.formGroup.get('discount_type').markAsTouched();;
      return false;
    }

    if (this.discount == 0 && this.formGroup.value.discount == '') {
      this.formGroup.get('discount_type').removeValidators(Validators.required);
      this.formGroup.get('discount_type').setErrors({ invalid: false });
      return false;
    }

    this.calculateInvoice();
  }

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  async _openInvoiceViewModal(invoiceId: any) {
    if (this.modalCtrl.getTop()) {
      this.modalCtrl.dismiss(false, 'dismiss');
    }
    const modal = await this.modalCtrl.create({
      component: ViewInvoicePage,
      mode: 'ios',
      componentProps: {
        invoiceId: invoiceId,
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
    this.offset = 0;
    event.component.startSearch();
    this.customerApi.get('', searchText, this.offset, this.limit, { active: '1' }).subscribe({
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
    this.offset = 0;
    event.component.startSearch();
    this.projectApi.get('', searchText, this.offset, this.limit, { active: '1' }).subscribe({
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
  searchStaff(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    this.offset = 0;
    event.component.startSearch();
    this.staffApi.get('', searchText, this.offset, this.limit).subscribe({
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
  searchItems(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    this.offset = 0;
    event.component.startSearch();
    this.itemApi.get('', searchText, this.offset, this.limit).subscribe({
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
  onDueDateChange(event: any) {
    const selectedDate = event.detail.value;
    this.formGroup.get('duedate').setValue(selectedDate);
    this.isDueDateModalOpen = false;
  }

}
