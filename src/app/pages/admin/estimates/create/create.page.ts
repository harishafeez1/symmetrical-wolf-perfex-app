import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { format, parseISO } from 'date-fns';
import { CommonApiService } from 'src/app/services/common-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { ItemApiService } from 'src/app/services/item-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { EstimateApiService } from 'src/app/services/estimate-api.service';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { Estimate } from 'src/app/interfaces/estimate';
import { Customer } from 'src/app/interfaces/customer';
import { InvoiceItem } from 'src/app/interfaces/invoice-item';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewEstimatePage } from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { Subscription } from 'rxjs';
import { AnimationService } from 'src/app/services/animation.service';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  @Input() proposal: any;
  @Input() estimateId: any;
  @Input() type = '';
  @Input() extraInfo: any;
  estimate_id = this.activatedRoute.snapshot.paramMap.get('id');
  settings: any;
  customers: Customer[] = [];
  isLoading = true;
  drafting = false;
  submitting = false;
  projects = [];

  offset = 0;
  limit = 20;

  formGroup: UntypedFormGroup;
  selectedTab = 'estimate_details';
  countries: any;
  currencies: any;
  defaultCurrency = null;
  staffs: any;
  items: any;
  taxes:any = [];
  estimateRecurringValue = 0;
  selectedItemTaxRate: any;
  selectedItem: InvoiceItem = {
    description: '',
    long_description: '',
    qty: 1,
    rate: 0,
    taxrate: [],
    unit: ''
  };
  estimateItems = [];

  subTotal = 0;
  total = 0;
  totalTaxes: any[] = [];
  discount = 0;
  total_discount = 0;
  estimate: Estimate;
  statuses = [];

  isPopoverOpen = false;
  selected_dicount_type = 'discount-type-percent';
  private country$: Subscription;
  private currency$: Subscription;
  @ViewChild('myInput') myInput: IonInput | undefined;
  tags: any[] = [];
  isExpiryDateModalOpen = false;
  isEstimateDateModalOpen = false;
  constructor(
    private nav: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private estimateApi: EstimateApiService,
    private proposalApi: ProposalApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private customerApi: CustomerApiService,
    private projectApi: ProjectApiService,
    private commonApi: CommonApiService,
    private staffApi: StaffApiService,
    private itemApi: ItemApiService,
    public estimateHelper: EstimatesHelper,
    private settingHelper: SettingsHelper,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private animationService: AnimationService,
  ) { }
  
  ngOnInit() {
    this.estimate_id = this.estimate_id ?? this.estimateId;
    this.statuses = this.estimateHelper.get_statuses();
    this.getEstimate();

    this.formGroup = this.fb.group({
      clientid: ['', [Validators.required]],
      project_id: [''],
      number: [this.settings?.next_estimate_number, [Validators.required]],
      date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      expirydate: [''],
      currency: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      status: [1],
      reference_no: [''],
      sale_agent: [''],

      discount_type: [''],
      adminnote: [''],

      select_item: [''],
      show_quantity_as: ["1"],
      adjustment: [0],

      clientnote: [this.settings?.predefined_clientnote_estimate],
      terms: [this.settings?.predefined_terms_estimate],

      billing_street: [''],
      billing_city: [''],
      billing_state: [''],
      billing_zip: [''],
      billing_country: [''],

      include_shipping: [0],
      show_shipping_on_estimate: [0],

      shipping_street: [''],
      shipping_city: [''],
      shipping_state: [''],
      shipping_zip: [''],
      shipping_country: [''],
      removed_items: [],

      custom_fields: this.fb.group({
        estimate: this.fb.group([])
      })
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras?.state) {
        const data = this.router.getCurrentNavigation().extras.state;

        this.formGroup.patchValue({
          clientid: {
            userid: data.userid,
            company: data.company
          },
        });
      }
    });

    this.settingHelper.settings.subscribe(response => {
      this.settings = response;
      if (!this.estimate) {
        this.formGroup.patchValue({
          date: this.dateTimePipe.transform(new Date()),
          number: this.settings?.next_estimate_number
        });
      }
    });

   /*  if (this.type === 'modal' && this.extraInfo) {
      this.formGroup.patchValue({
        clientid: {
          userid: this.extraInfo.userid,
          company: this.extraInfo.company
        },
      });
    } */
    console.log(this.proposal);
  }
  ngOnDestroy() {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }
  getEstimate() {
    if (this.estimate_id) {
      this.isLoading = true;
      this.estimateApi.get(this.estimate_id).subscribe({
        next: (res: Estimate) => {
          console.log(res);
          this.estimate = res;
  
          this.formGroup.patchValue({
            number: this.estimate.number,
            date: this.estimate.date ? this.dateTimePipe.transform(this.estimate.date) : '',
            expirydate: this.estimate.expirydate ? this.dateTimePipe.transform(this.estimate.expirydate) : '',
            status: parseInt(this.estimate.status),
            reference_no: this.estimate.reference_no,
  
            adminnote: this.estimate.adminnote ? this.estimate.adminnote.replace(new RegExp('<br />', 'g'), '') : '',
  
            show_quantity_as: this.estimate.show_quantity_as,
            discount_type: this.estimate.discount_type,
  
            clientnote: this.estimate.clientnote ? this.estimate.clientnote.replace(new RegExp('<br />', 'g'), '') : '',
            terms: this.estimate.terms ? this.estimate.terms.replace(new RegExp('<br />', 'g'), '') : '',
  
            billing_street: this.estimate.billing_street ? this.estimate.billing_state.replace(new RegExp('<br />', 'g'), '') : '',
            billing_city: this.estimate.billing_city,
            billing_state: this.estimate.billing_state,
            billing_zip: this.estimate.billing_zip,
  
            include_shipping: (this.estimate.include_shipping == 0 ? false : true),
            show_shipping_on_estimate: (this.estimate.show_shipping_on_estimate == 0 ? false : true),
  
            shipping_street: this.estimate.shipping_street ? this.estimate.shipping_street.replace(new RegExp('<br />', 'g'), '') : '',
            shipping_city: this.estimate.shipping_city,
            shipping_state: this.estimate.shipping_state,
            shipping_zip: this.estimate.shipping_zip,
          });
  
          this.discount = this.estimate.discount_percent != 0 ? this.estimate.discount_percent : this.estimate.discount_total;
          this.selected_dicount_type = this.estimate.discount_percent != 0 ? 'discount-type-percent' : 'discount-type-fixed';
          this.tags = (this.estimate.tags && this.estimate.tags.length) ? this.estimate.tags.split(',') : []
  
          this.loadApiData();
        }, error: () => {this.isLoading = false}
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
            this.defaultCurrency = Object.assign({}, currency);
            this.formGroup.controls.currency.setValue(currency.id);
            break;
          }
        }
  
        if (this.estimate) {
          this.formGroup.controls.currency.setValue(this.estimate.currency);
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
        if (this.estimate) {
          this.formGroup.controls.billing_country.setValue(this.estimate.billing_country);
          this.formGroup.controls.shipping_country.setValue(this.estimate.shipping_country);
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
  
        if (this.estimate) {
          for (let item of this.estimate.items) {
            removed_items.push(item.id);
          }
  
          this.estimateItems = this.estimate.items;
          this.formGroup.controls.adjustment.setValue(this.estimate.adjustment);
          this.subTotal = parseFloat(this.estimate.subtotal);
          this.total = parseFloat(this.estimate.total);
        } else if (this.proposal) {
          for (let item of this.proposal.items) {
            removed_items.push(item.id);
          }
  
          this.estimateItems = this.proposal.items;
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
        if (this.estimate) {
          this.formGroup.controls.sale_agent.setValue(this.estimate.sale_agent);
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

  get include_shipping() {
    return this.formGroup.get('include_shipping');
  }

  get adjustment() {
    return this.formGroup.get('adjustment');
  }

  customerSelect(event: any) {
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

      currency: event.value.default_currency != 0 ? event.value.default_currency : this.defaultCurrency.id
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
      next: (res: any) => {
        if (res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
          if (this.estimate?.project_data?.name && projectChanging === true) {
            this.formGroup.controls.project_id.setValue({
              id: this.estimate.project_data?.id,
              name: this.estimate?.project_data.name
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
  
        if (this.estimate) {
          this.estimate.client.symbol = this.estimate.symbol;
          this.estimate.client.decimal_separator = this.estimate.decimal_separator;
          this.estimate.client.thousand_separator = this.estimate.thousand_separator;
          this.formGroup.controls.clientid.setValue(this.estimate.client);
  
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.estimate.client.userid
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
          this.formGroup.controls.clientid.setValue({
            userid: this.extraInfo.userid,
            company: this.extraInfo.company
          });
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

  createEstimate(save = '') {
    // console.log(this.formGroup.value);
    // console.log(this.estimateItems);
    if (this.estimateItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the estimate', 'danger');
      return false;
    }
    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = Number(this.total_discount) > 0 ? Number(this.total_discount).toFixed(2) : 0.00;
    getRawValue.tags = this.tags.length ?  this.tags.toString() : '';

    this.drafting = false;
    this.submitting = true;
    if (save == 'save_as_draft') {
      getRawValue.save_as_draft = true;
      this.drafting = true;
      this.submitting = false;
    }

    if (this.proposal) {
      this.proposalApi.convertToEstimate(this.proposal.id, getRawValue, this.estimateItems).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.mpcToast.show(res.message);
            window.dispatchEvent(new CustomEvent('admin:estimate_created'));
            this.router.navigate(['/admin/estimates/view/', res.insert_id]);
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

    this.estimateApi.store(getRawValue, this.estimateItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:estimate_created'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/estimates/view/', res.insert_id]);
          } else {
            this._openEstimateViewModal(res.insert_id);
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

  updateEstimate() {
    if (this.estimateItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the estimate', 'danger');
      return false;
    }

    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = Number(this.total_discount) > 0 ? Number(this.total_discount).toFixed(2) : 0.00;
    getRawValue.tags = this.tags.length ?  this.tags.toString() : '';
    
    this.submitting = true;
    this.estimateApi.update(this.estimate_id, getRawValue, this.estimateItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:estimate_updated'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/estimates/view/', this.estimate_id]);
          } else {
            this._openEstimateViewModal(this.estimate_id);
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
      this.selectedItem.unit = event.value.unit;
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

  addItemToEstimate() {
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

    this.estimateItems.push(newItem);
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
    this.calculateEstimate();
  }

  calculateEstimate() {
    this.subTotal = 0;
    this.total = 0;
    this.totalTaxes = [];
    this.estimateItems.forEach((item) => {
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
    this.calculateEstimate();
  }

  removeItemToEstimate(index: any) {
    this.estimateItems.splice(index, 1);
    this.calculateEstimate();
    console.log(index, this.estimateItems);
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

    this.calculateEstimate();
  }

  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }

  async _openEstimateViewModal(estimateId: any) {
    this.close(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewEstimatePage,
      mode: 'ios',
      componentProps: {
        estimateId: estimateId,
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
    this.projectApi.get('', searchText, this.offset, this.limit).subscribe({
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
  searchStaffs(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    this.offset = 0;
    event.component.startSearch();
    this.staffApi.get('', searchText, this.offset, this.limit, { active: '1' }).subscribe({
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
}
