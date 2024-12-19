import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { SubscriptionApiService } from 'src/app/services/subscription-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewSubscriptionPage } from '../view/view.page';
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
export class CreatePage implements OnInit,OnDestroy {
  @Input() subscriptionId:any;
  @Input() type = '';
  subscription_id = this.activatedRoute.snapshot.paramMap.get('id');
  formGroup: UntypedFormGroup;

  subscription: any;
  subscription_error = false;
  isLoading = true;
  submitting = false;

  selectedCurrency: any;

  customers = [];
  projects = [];

  statuses = [];

  plans            = [];
  stripe_tax_rates = [];
  currencies       = [];
  checkCustomerCurrency = false;
  isDateModalOpen = false;
 
  private currency$: Subscription;
  constructor(
    private nav: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private customerApi: CustomerApiService,
    private subscriptionApi: SubscriptionApiService,
    private projectHelper: ProjectsHelper,
    private staffApi: StaffApiService,
    private projectApi: ProjectApiService,
    private currencyApi: CurrencyApiService,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private animationService: AnimationService,
  ) {
  }

  getSubscription() {
    if (this.subscription_id) {
      this.isLoading = true;
      this.subscriptionApi.get(this.subscription_id).subscribe({
        next: (res: any) => {
          this.subscription = res;
  
          this.formGroup.patchValue({
            name: this.subscription.name,
            quantity: this.subscription.quantity,
            date: this.subscription.date ? this.dateTimePipe.transform(this.subscription.date) : '',
            description: this.subscription.description ? this.subscription.description.replaceAll('<br />', '') : '',
            description_in_item: (this.subscription.description_in_item == 0 ? false : true),
            terms: this.subscription.terms
          });
  
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
        if (this.subscription) {
          this.formGroup.controls.currency.setValue(this.subscription.currency);
        }
      }
    })

    this.subscriptionApi.get_plans().subscribe({
      next: (response: any) => {
        this.subscription_error = false;
        if(response.status) {
          this.plans            = response.plans.data;
          this.stripe_tax_rates = response.stripe_tax_rates.data;
          
          if(this.subscription) {
            this.formGroup.controls.stripe_plan_id.setValue(this.subscription.stripe_plan_id);
            this.formGroup.controls.stripe_tax_id.setValue(this.subscription.stripe_tax_id);
            this.formGroup.controls.stripe_tax_id_2.setValue(this.subscription.stripe_tax_id_2);
          }
        } else {
          this.subscription_error = response?.subscription_error;
        }
      }
    });

    this.getCustomers();
  }

  ngOnInit() {
    this.subscription_id = this.subscription_id ?? this.subscriptionId;
    this.statuses = this.projectHelper.get_project_statuses();

    this.formGroup = this.fb.group({
      stripe_plan_id: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.minLength(1)]],
      date: [''],

      name: ['', [Validators.required]],
      description: [''],
      description_in_item: [false],

      clientid: ['', [Validators.required]],
      project_id: [''],

      currency: [{
        value: '',
        disabled: true
      }, [Validators.required]],
      stripe_tax_id: [''],
      stripe_tax_id_2: [''],
      terms: ['']
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        const data = this.router.getCurrentNavigation().extras.state;
        this.formGroup.patchValue({ clientid: data.userid });
      }
    });
    this.getSubscription();
  }
  ngOnDestroy(): void {
    this.currency$.unsubscribe();
  }

  getCustomers(event: any = false) {
    this.customerApi.get('', '', null, null,{active: '1'}).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.subscription && this.subscription.clientid != 0) {
          this.formGroup.controls.clientid.setValue({
            userid: this.subscription.clientid,
            company: this.subscription.company
          });
          this.projects = [];
          if (event == false) {
            const __event = {
              value: {
                userid: this.subscription.clientid
              }
            };
            this.getProjects(__event);
            this.getCustomerCurrencyMatch();
          }
        }
  
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getProjects(event: any = false, projectChanging = true) {
    this.formGroup.controls.project_id.reset();

    this.projectApi.get('', '', null, null, {
      clientid: event.value.userid
    }).subscribe({
      next: (res: any) => {
        if(res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
  
          if(this.subscription?.project_id && projectChanging === true ) {
            this.formGroup.controls.project_id.setValue({
              id: this.subscription.project_id,
              name: this.subscription.project_name
            });
          }
        }
      }
    });
  }

  customerSelect(event: any) {
    console.log(event);
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
    this.formGroup.patchValue({  
      currency: (!event.value.default_currency || event.value.default_currency == '0') ?  defaultCurrency.id : event.value.default_currency
    });
    console.log('formGroup value =>', this.formGroup.value);
    this.projects = [];
    this.getProjects(event, false);
  }

  updateSubscription() {
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
    const selectCustomer = (this.formGroup.value.clientid && this.customers.length) ? this.customers.find(customer => customer.userid == this.formGroup.value.clientid.userid) : {};
    console.log('selectCustomer data =>', selectCustomer);
    this.formGroup.value.currency = (!selectCustomer.default_currency || selectCustomer.default_currency == '0') ? defaultCurrency.id : selectCustomer.default_currency;
    // this.formGroup.value.currency = this.selectedCurrency;
    this.formGroup.value.clientid = this.formGroup.value.clientid ? this.formGroup.value.clientid.userid : ''; 
    console.log('updateSubscription formGroup value =>', this.formGroup.value);
    // return;
    this.submitting = true;
    this.subscriptionApi.update(this.subscription_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          if(this.type !== 'modal'){
            this.router.navigate(['/admin/subscriptions/view/' , this.subscription_id]);
          }else{
            this._openSubscriptionViewModal(this.subscription_id);
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

  createSubscription() {
    const defaultCurrency = this.currencies ? this.currencies.find(currency => currency.isdefault == 1) : {};
     const selectCustomer = this.formGroup.value.clientid ?? {};
    this.formGroup.value.currency = (!selectCustomer.default_currency || selectCustomer.default_currency == '0') ?  defaultCurrency.id : selectCustomer.default_currency;
    this.formGroup.value.clientid = this.formGroup.value.clientid ? this.formGroup.value.clientid.userid : ''; 
    this.submitting = true;
    this.subscriptionApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.router.navigate(['/admin/subscriptions/view/' , res.insert_id]);
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
  close(data = false, role = 'dismiss'){
    this.modalCtrl.dismiss(data,role);
  }
  async _openSubscriptionViewModal(subscriptionId:any){
    this.close(true, 'data');
     const modal = await this.modalCtrl.create({
      component: ViewSubscriptionPage,
      mode: 'ios',
      componentProps: {
        subscriptionId: subscriptionId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if(modalFilters.data){
       
      }
    });
    return await modal.present();
  }
  getCustomerCurrencyMatch(){
    const findCustomer = this.customers.find(c => c.userid == this.subscription.clientid);
    console.log('findCustomer =>', findCustomer);
    console.log('subscription =>', this.subscription);
    console.log('value =>', (findCustomer.symbol == this.subscription.symbol) ? false : true);
    this.checkCustomerCurrency = findCustomer ? ((findCustomer.symbol == this.subscription.symbol) ? false : true) : false;
    // return findCustomer ? ((findCustomer.symbol == this.subscription.symbol) ? false : true) : false;
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
    this.projectApi.get('', searchText, 0, 20, {
      clientid: this.formGroup.value.clientid.userid
    }).subscribe({
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
