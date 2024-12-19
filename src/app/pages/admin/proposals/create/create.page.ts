import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { ItemApiService } from 'src/app/services/item-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { format, parseISO } from 'date-fns';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewProposalPage } from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { Subscription } from 'rxjs';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { AnimationService } from 'src/app/services/animation.service';

class Item {
  public description: string;
  public long_description: string;
  public qty: number;
  public rate: number;
  public taxrate?: any;
  public unit?: any
}

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  proposal_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() extraInfo: any;
  @Input() proposalId: any;
  @Input() type = '';
  customers = [];
  leads = [];

  isLoading = true;
  drafting = false;
  submitting = false;

  statuses = [];

  offset = 0;
  limit = 20;

  formGroup: UntypedFormGroup;
  selectedTab = 'customer_details';
  countries: any;
  currencies: any;
  staffs: any;
  items: any;
  taxes = [];
  selectedCurrency: any = null;
  defaultCurrency = null;
  selectedItemTaxRate: any;
  selectedItem: Item = {
    description: '',
    long_description: '',
    qty: 1,
    rate: 0,
    taxrate: [],
    unit: ''
  };

  proposalItems = [];

  subTotal = 0;
  total = 0;
  totalTaxes: any[] = [];
  discount = 0;
  total_discount = 0;
  proposal: any;

  isPopoverOpen = false;
  selected_dicount_type = 'discount-type-percent';
  private country$: Subscription;
  private currency$: Subscription;
  projects: any = []
  @ViewChild('myInput') myInput: IonInput | undefined;
  tags: any[] = [];
  setting: any;
  isOpenTillModalOpen = false;
  isProposalDateModalOpen = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private proposalApi: ProposalApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private customerApi: CustomerApiService,
    private leadApi: LeadApiService,
    private commonApi: CommonApiService,
    private staffApi: StaffApiService,
    private itemApi: ItemApiService,
    public proposalHelper: ProposalsHelper,
    private settingHelper: SettingsHelper,
    private nav: NavController,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private projectApi: ProjectApiService,
    private animationService: AnimationService,
  ) { }

  getProposal() {
    if (this.proposal_id) {
      this.isLoading = true;
      this.proposalApi.get(this.proposal_id).subscribe({
        next: (res) => {
          this.proposal = res;
  
          this.formGroup.patchValue({
            subject: this.proposal.subject,
            rel_type: this.proposal.rel_type,
            date: this.proposal.date ? this.dateTimePipe.transform(this.proposal.date) : '',
            open_till: this.proposal.open_till ? this.dateTimePipe.transform(this.proposal.open_till) : '',
            discount_type: this.proposal.discount_type,
            allow_comments: this.proposal.allow_comments,
            status: parseInt(this.proposal.status),
            proposal_to: this.proposal.proposal_to,
            email: this.proposal.email,
            phone: this.proposal.phone,
  
            select_item: [''],
            show_quantity_as: this.proposal.show_quantity_as,
            adjustment: [0],
  
            address: this.proposal.address ? this.proposal.address.replaceAll('<br />', '') : '',
            city: this.proposal.city,
            state: this.proposal.state,
            zip: this.proposal.zip,
            country: this.proposal.country
          });
  
          this.discount = this.proposal.discount_percent != 0 ? this.proposal.discount_percent : this.proposal.discount_total;
          this.selected_dicount_type = this.proposal.discount_percent != 0 ? 'discount-type-percent' : 'discount-type-fixed';
          this.tags = (this.proposal.tags && this.proposal.tags.length) ? this.proposal.tags.split(',') : []
  
          this.loadApiData();
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
            this.selectedCurrency = Object.assign({}, currency);
            this.defaultCurrency = Object.assign({}, currency);
            this.formGroup.controls.currency.setValue(currency.id);
            break;
          }
        }

        if (this.proposal) {
          this.formGroup.controls.currency.setValue(this.proposal.currency);
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
        if (this.proposal) {
          this.formGroup.controls.country.setValue(this.proposal.country);
        }
      }
    })

    this.leadApi.get().subscribe({
      next: response => {
        this.leads = response;
        if (this.proposal && this.proposal.rel_type == 'lead') {
          this.formGroup.controls.rel_id.setValue(this.proposal.rel_id);
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
  
        if (this.proposal) {
          for (let item of this.proposal.items) {
            removed_items.push(item.id);
          }
  
          this.proposalItems = this.proposal.items;
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
        if (this.proposal && this.proposal.assigned != 0) {
          this.formGroup.controls.assigned.setValue(this.proposal.assigned);
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

  ngOnInit() {
    this.proposal_id = this.proposal_id ?? this.proposalId;
    this.statuses = this.proposalHelper.get_statuses();

    this.getProposal();

    this.formGroup = this.fb.group({
      subject: ['', [Validators.required]],
      rel_type: ['', [Validators.required]],
      rel_id: ['', [Validators.required]],
      date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      open_till: [''],
      currency: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      discount_type: [''],
      allow_comments: [''],
      status: [6],
      assigned: [''],
      proposal_to: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],

      select_item: [''],
      show_quantity_as: ["1"],
      adjustment: [0],

      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: [''],

      removed_items: [],

      custom_fields: this.fb.group({
        proposal: this.fb.group([])
      })
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        const data = this.router.getCurrentNavigation().extras.state;

        this.formGroup.patchValue({
          rel_type: data.rel_type,
          rel_id: data.rel_id,
          proposal_to: data.name,
          email: data.email
        });
      }
    });

    if (this.type === 'modal' && this.extraInfo) {
      this.formGroup.patchValue({
        rel_type: this.extraInfo.rel_type,
        rel_id: this.extraInfo.rel_id,
        proposal_to: this.extraInfo.name,
        email: this.extraInfo.email
      });
    }

    this.settingHelper.settings.subscribe((response) => {
      this.setting = response;
      if (this.setting?.perfex_current_version >= '294') {
        this.formGroup.addControl('project_id', this.fb.control(''));
      }
    });
  }

  ngOnDestroy(): void {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  get clientid() {
    return this.formGroup.get('clientid');
  }

  get rel_type() {
    return this.formGroup.get('rel_type');
  }

  get adjustment() {
    return this.formGroup.get('adjustment');
  }

  customerSelect(event: any) {
    console.log('customerSelect event =>', event);
    const customer = this.customers.filter((c) => c.userid == event.value)[0];

    if (customer) {
      if (customer.default_currency == 0) {
        this.selectedCurrency = Object.assign({}, this.defaultCurrency);

        // console.log(customer, this.selectedCurrency, this.defaultCurrency);
      } else {
        // console.log('customer.......',customer, this.selectedCurrency);
        this.selectedCurrency.id = customer.default_currency;
        this.selectedCurrency.name = customer.currency_name;
        this.selectedCurrency.isdefault = customer.isdefault;
        this.selectedCurrency.symbol = customer.symbol;
        this.selectedCurrency.decimal_separator = customer.decimal_separator;
        this.selectedCurrency.thousand_separator = customer.thousand_separator;
      }

      this.formGroup.patchValue({
        proposal_to: (customer.name !== null ? customer.name : customer.company),
        phone: customer.phonenumber,
        email: customer.email,
        address: customer.billing_street,
        city: customer.billing_city,
        state: customer.billing_state,
        zip: customer.billing_zip,
        country: customer.billing_country,
        currency: this.selectedCurrency.id
      });
    }
    this.projects = [];
    const __event = {
      value: {
        userid: event.value
      }
    };
    this.getProjects(__event, false);

  }

  addTag(input: IonInput) {
    const value = input.value;
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
    if (this.setting?.perfex_current_version >= '294') {
      this.formGroup.controls.project_id.reset();

      this.projectApi.get('', '', null, null, {
        clientid: event.value.userid
      }).subscribe({
        next: (response: any) => {
          if (response.status !== false) {
            this.projects.push(...response);
            this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
            if (this.proposal?.project_data && projectChanging === true) {
              // this.formGroup.controls.project_id.setValue(this.proposal.project_data?.id);
              this.formGroup.controls.project_id.setValue({
                id: this.proposal.project_data?.id,
                name: this.proposal.project_data?.name
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
  }

  leadSelect(event: any) {
    const lead = this.leads.filter((c) => c.id == event.value)[0];
    console.log(lead);
    if (lead) {
      this.formGroup.patchValue({
        proposal_to: [lead.name],
        phone: [lead.phonenumber],
        email: [lead.email],
        address: [lead.address],
        city: [lead.city],
        state: [lead.state],
        zip: [lead.zip],
        country: [lead.country]
      });
    }

  }

  getCustomers(event: any = false) {
    this.customerApi.get('', '', this.offset, this.limit, { active: '1' }).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.proposal && this.proposal.rel_type == 'customer') {
          this.selectedCurrency.symbol = this.proposal.symbol;
          this.selectedCurrency.decimal_separator = this.proposal.decimal_separator;
          this.selectedCurrency.thousand_separator = this.proposal.thousand_separator;
  
          this.formGroup.controls.rel_id.setValue(this.proposal.rel_id);
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.proposal.client.userid
              }
            };
            this.getProjects(__event);
          }
        } else if (this.extraInfo) {
          this.formGroup.controls.rel_id.setValue(this.extraInfo.rel_id);
          const customer = this.customers.find((c) => c.userid == this.formGroup.value.rel_id);
  
          if (customer) {
            if (customer.default_currency == 0) {
              this.selectedCurrency = Object.assign({}, this.defaultCurrency);
            } else {
              this.selectedCurrency.id = customer.default_currency;
              this.selectedCurrency.name = customer.currency_name;
              this.selectedCurrency.isdefault = customer.isdefault;
              this.selectedCurrency.symbol = customer.symbol;
              this.selectedCurrency.decimal_separator = customer.decimal_separator;
              this.selectedCurrency.thousand_separator = customer.thousand_separator;
            }
  
            this.formGroup.patchValue({
              proposal_to: (customer.name !== null ? customer.name : customer.company),
              phone: customer.phonenumber,
              email: customer.email,
              address: customer.billing_street,
              city: customer.billing_city,
              state: customer.billing_state,
              zip: customer.billing_zip,
              country: customer.billing_country,
              currency: this.selectedCurrency.id
            });
          }
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.extraInfo.rel_id
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

  createProposal(save = '') {
    console.log(this.formGroup.value);
    console.log(this.proposalItems);
    if (this.proposalItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the proposal', 'danger');
      return false;
    }

    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = this.total_discount > 0 ? this.total_discount.toFixed(2) : 0.00;
    getRawValue.tags = this.tags.length ? this.tags.toString() : '';
    this.drafting = false;
    this.submitting = true;
    if (save == 'save_as_draft') {
      this.drafting = true;
      this.submitting = false;
      getRawValue.save_as_draft = true;
    }

    this.proposalApi.store(getRawValue, this.proposalItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:proposal_created'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/proposals/view/', res.insert_id]);
          } else {
            this._openProposalViewModal(res.insert_id);
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

  updateProposal() {
    console.log(this.formGroup.value);
    console.log(this.proposalItems);

    if (this.proposalItems.length == 0) {
      this.mpcToast.show('Please add at least one item to create the proposal', 'danger');
      return false;
    }

    const getRawValue = this.formGroup.getRawValue();
    getRawValue.subtotal = this.subTotal.toFixed(2);
    getRawValue.total = this.total.toFixed(2);
    getRawValue.discount_percent = this.selected_dicount_type == 'discount-type-percent' ? this.discount : '';
    getRawValue.discount_total = this.total_discount > 0 ? this.total_discount.toFixed(2) : 0.00;
    getRawValue.tags = this.tags.length ? this.tags.toString() : '';

    this.drafting = false;
    this.submitting = true;
    this.proposalApi.update(this.proposal_id, getRawValue, this.proposalItems).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:proposal_updated'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/proposals/view/', this.proposal_id]);
          } else {
            this._openProposalViewModal(this.proposal_id);
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

  relTypeChange(event) {
    if (event.detail.value == 'lead') {
      this.formGroup.get('currency').enable();
    } else {
      this.formGroup.get('currency').disable();
    }

    this.formGroup.get('rel_id').reset();
    if(this.projects.length){
      this.projects = [];
      this.formGroup.controls.project_id.reset();
    }
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
      this.selectedItem.rate = parseInt(event.value.rate);

      this.selectedItem.taxrate = [];
      if (event.value.tax_id_1 !== null) {
        this.selectedItem.taxrate.push({
          id: event.value.tax_id_1,
          name: event.value.taxname_1,
          taxrate: event.value.taxrate_1
        });
      } else if (event.value.tax_id_2 !== null) {
        this.selectedItem.taxrate.push({
          id: event.value.tax_id_2,
          name: event.value.taxname_2,
          taxrate: event.value.taxrate_2
        });
      }
    }
  }

  addItemToProposal() {
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

    this.proposalItems.push(newItem);
    this.formGroup.controls.select_item.reset();
    this.selectedItem = {
      description: '',
      long_description: '',
      qty: 1,
      rate: 0,
      taxrate: [],
      unit: ""
    }
    console.log(newItem);
    this.calculateProposal();
  }

  calculateProposal() {
    this.subTotal = 0;
    this.total = 0;
    this.totalTaxes = [];
    this.proposalItems.forEach((item) => {
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
    console.log('total:', this.total);
    console.log(this.totalTaxes);
    console.log(this.total_discount);
  }

  changeDiscountType(discount_type) {
    this.selected_dicount_type = discount_type;
    this.calculateProposal();
  }

  removeItemToProposal(index: any) {
    this.proposalItems.splice(index, 1);
    this.calculateProposal();
    console.log(index, this.proposalItems);
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

    this.calculateProposal();
  }

  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }

  async _openProposalViewModal(proposalId: any) {
    this.close(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewProposalPage,
      mode: 'ios',
      componentProps: {
        proposalId: proposalId,
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
  searchLeads(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    this.offset = 0;
    event.component.startSearch();
    this.leadApi.get('', searchText, this.offset, this.limit, { active: '1' }).subscribe({
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
