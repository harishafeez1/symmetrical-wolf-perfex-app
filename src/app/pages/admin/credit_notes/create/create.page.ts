import { Component, Input, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController, ToastController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { format, parseISO } from 'date-fns';
import { CommonApiService } from 'src/app/services/common-api.service';
import { ItemApiService } from 'src/app/services/item-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { Customer } from 'src/app/interfaces/customer';
import { InvoiceItem } from 'src/app/interfaces/invoice-item';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewCreditNotePage } from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { Subscription } from 'rxjs';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  @Input() creditNoteId: any;
  @Input() type = '';
  @Input() extraInfo: any;
  credit_note_id = this.activatedRoute.snapshot.paramMap.get('id');
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
  items: any;
  taxes = [];
  selectedItemTaxRate: any;
  selectedItem: InvoiceItem = {
    description: '',
    long_description: '',
    qty: 1,
    rate: 0,
    taxrate: [],
    unit: ''
  };
  creditNoteItems = [];

  subTotal = 0;
  total = 0;
  totalTaxes: any[] = [];
  discount = 0;
  total_discount = 0;
  credit_note: any;

  isPopoverOpen = false;
  selected_dicount_type = 'discount-type-percent';
  private country$: Subscription;
  private currency$: Subscription;
  isInvoiceDateModalOpen = false;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private creditNoteApi: CreditNoteApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private customerApi: CustomerApiService,
    private projectApi: ProjectApiService,
    private commonApi: CommonApiService,
    private settingHelper: SettingsHelper,
    private itemApi: ItemApiService,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private router: Router,
    private animationService: AnimationService,
  ) {
  }
  ngOnInit() {
    this.credit_note_id = this.credit_note_id ?? this.creditNoteId;
    this.getCreditNote();

    this.formGroup = this.fb.group({
      clientid: ['', [Validators.required]],
      project_id: [''],
      number: [this.settings?.next_credit_note_number, [Validators.required]],
      date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      currency: [{
        value: '',
        disabled: true
      }, [Validators.required]],

      discount_type: [''],
      reference_no: [''],
      adminnote: [''],

      select_item: [''],
      show_quantity_as: ["1"],
      adjustment: [0],

      clientnote: [this.settings?.predefined_clientnote_credit_note],
      terms: [this.settings?.predefined_terms_credit_note],

      billing_street: [''],
      billing_city: [''],
      billing_state: [''],
      billing_zip: [''],
      billing_country: [''],

      include_shipping: [0],
      show_shipping_on_credit_note: [0],

      shipping_street: [''],
      shipping_city: [''],
      shipping_state: [''],
      shipping_zip: [''],
      shipping_country: [''],
      removed_items: [],
      custom_fields: this.fb.group({
        credit_note: this.fb.group([])
      })
    });

    this.settingHelper.settings.subscribe(response => {
      this.settings = response;
      if (!this.credit_note) {
        this.formGroup.patchValue({
          date: this.dateTimePipe.transform(new Date()),
          number: this.settings?.next_credit_note_number
        });
      }
    });
  }
  ngOnDestroy() {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }
  getCreditNote() {
    if (this.credit_note_id) {
      this.isLoading = true;
      this.creditNoteApi.get(this.credit_note_id).subscribe({
        next: (res) => {
          console.log(res);
          this.credit_note = res;
  
          this.formGroup.patchValue({
            number: this.credit_note.number,
            date: this.credit_note.date ? this.dateTimePipe.transform(this.credit_note.date) : '',
            adminnote: this.credit_note.adminnote ? this.credit_note.adminnote.replaceAll('<br />', '') : '',
            show_quantity_as: this.credit_note.show_quantity_as,
            discount_type: this.credit_note.discount_type,
            reference_no: this.credit_note.reference_no,
  
            clientnote: this.credit_note.clientnote ? this.credit_note.clientnote.replaceAll('<br />', '') : '',
            terms: this.credit_note.terms ? this.credit_note.terms.replaceAll('<br />', '') : '',
  
            billing_street: this.credit_note.billing_street ? this.credit_note.billing_street.replaceAll('<br />', '') : '',
            billing_city: this.credit_note.billing_city,
            billing_state: this.credit_note.billing_state,
            billing_zip: this.credit_note.billing_zip,
  
            include_shipping: (this.credit_note.include_shipping == 0 ? false : true),
            show_shipping_on_credit_note: (this.credit_note.show_shipping_on_credit_note == 0 ? false : true),
  
            shipping_street: this.credit_note.shipping_street ? this.credit_note.shipping_street.replaceAll('<br />', '') : '',
            shipping_city: this.credit_note.shipping_city,
            shipping_state: this.credit_note.shipping_state,
            shipping_zip: this.credit_note.shipping_zip,
          });
  
          this.discount = this.credit_note.discount_percent != 0 ? this.credit_note.discount_percent : this.credit_note.discount_total;
          this.selected_dicount_type = this.credit_note.discount_percent != 0 ? 'discount-type-percent' : 'discount-type-fixed';
  
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

        if (this.credit_note) {
          this.formGroup.controls.currency.setValue(this.credit_note.currency);
        }
      }
    })

    this.country$ = this.countryApi.getCountriesData().subscribe(async res => {
      if (!res) {
        this.countryApi.get().subscribe({
          next: async response => {
            this.countryApi.setCountriesData(response);
          }
        });
      } else {
        this.countries = await res;
        if (this.credit_note) {
          this.formGroup.controls.billing_country.setValue(this.credit_note.billing_country);
          this.formGroup.controls.shipping_country.setValue(this.credit_note.shipping_country);
        }
      }
    })

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
  
        if (this.credit_note) {
          for (let item of this.credit_note.items) {
            removed_items.push(item.id);
          }
  
          this.creditNoteItems = this.credit_note.items;
          this.formGroup.controls.adjustment.setValue(this.credit_note.adjustment);
          this.subTotal = parseFloat(this.credit_note.subtotal);
          this.total = parseFloat(this.credit_note.total);
        }
  
        this.formGroup.controls.removed_items.setValue(removed_items);
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

  get adjustment() {
    return this.formGroup.get('adjustment');
  }

  get include_shipping() {
    return this.formGroup.get('include_shipping');
  }

  customerSelect(event: any) {
    // console.log('customerSelect event =>', event);
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

  getProjects(event: any = false, projectChanging = true) {
    this.formGroup.controls.project_id.reset();

    this.projectApi.get('', '', null, null, {
      clientid: event.value.userid
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
          if (this.credit_note?.project_name && projectChanging) {
            this.formGroup.controls.project_id.setValue({
              id: this.credit_note.project_id,
              name: this.credit_note.project_name
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
    this.customerApi.get('', '', this.offset, this.limit,{active: '1'}).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.credit_note) {
          this.credit_note.client.symbol = this.credit_note.symbol;
          this.credit_note.client.decimal_separator = this.credit_note.decimal_separator;
          this.credit_note.client.thousand_separator = this.credit_note.thousand_separator;
          this.formGroup.controls.clientid.setValue(this.credit_note.client);
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.credit_note.client.userid
              }
            };
            this.getProjects(__event);
          }
  
        }else if (this.extraInfo){
          console.log('this.extraInfo =>', this.extraInfo);
          this.formGroup.controls.clientid.setValue({
            userid: this.extraInfo.userid,
            company: this.extraInfo.company
          });
          console.log('form Group =>', this.formGroup.value.clientid);
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.extraInfo.userid
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
        this.isLoading = false;
        if (event) {
          event.component.items = this.customers;
          event.component.endInfiniteScroll();
        }
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  createCreditNote(save = '') {
    console.log(this.formGroup.value);
    console.log(this.creditNoteItems);
    if (this.creditNoteItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the credit_note', 'danger');
      return false;
    }


    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = Number(this.total_discount) > 0 ? Number(this.total_discount).toFixed(2) : 0.00;

    this.drafting = false;
    this.submitting = true;
    if (save == 'save_as_draft') {
      this.drafting = true;
      this.submitting = false;
      getRawValue.save_as_draft = true;
    }

    this.creditNoteApi.store(getRawValue, this.creditNoteItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:credit_note_created'));
          // this.nav.navigateRoot('/admin/credit_notes/view/' + res.insert_id);
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/credit_notes/view/', res.insert_id]);
          } else {
            this._openCreditNoteViewModal(res.insert_id);
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

  updateCreditNote() {
    console.log(this.formGroup.value);
    console.log(this.creditNoteItems);

    if (this.creditNoteItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the credit_note', 'danger');
      return false;
    }

    const getRawValue = this.formGroup.getRawValue();

    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = Number(this.total_discount) > 0 ? Number(this.total_discount).toFixed(2) : 0.00;

    this.submitting = true;
    this.creditNoteApi.update(this.credit_note_id, getRawValue, this.creditNoteItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:credit_note_updated'));
          if (this.type !== 'modal') {
            // this.nav.navigateRoot('/admin/credit_notes/view/' + this.credit_note_id);
            this.router.navigate(['/admin/credit_notes/view/', this.credit_note_id]);
          } else {
            this._openCreditNoteViewModal(this.credit_note_id);
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

  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }

  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }

  itemSelect(event: any) {
    console.log(event);
    if (event.value != null) {
      this.selectedItem.description = event.value.name;
      this.selectedItem.long_description = event.value.description;
      this.selectedItem.rate = parseInt(event.value.rate);
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
      unit: ''
    };
    this.creditNoteItems.push(newItem);
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
    this.creditNoteItems.forEach((item) => {
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
    this.creditNoteItems.splice(index, 1);
    this.calculateInvoice();
    console.log(index, this.creditNoteItems);
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

  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }

  async _openCreditNoteViewModal(creditNoteId: any) {
    this.close(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewCreditNotePage,
      mode: 'ios',
      componentProps: {
        creditNoteId: creditNoteId,
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
  searchItems(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    this.offset = 0;
    event.component.startSearch();
    this.itemApi.get('', searchText, this.offset, this.limit, { active: '1' }).subscribe({
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
