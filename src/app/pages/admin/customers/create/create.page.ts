import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit, OnDestroy {
  customer_id = this.activatedRoute.snapshot.paramMap.get('id');
  formGroup: UntypedFormGroup;
  selectedTab = 'customer_details';
  countries = [];
  languages: any = [];
  currencies = [{
    id: "0",
    name: this.translate.instant('system_default_string'),
    symbol: ''
  }];

  groups: any = [];
  customer: any;
  isLoading = true;
  submitting = false;
  private language$: Subscription;
  private country$: Subscription;
  private currency$: Subscription;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private customerApi: CustomerApiService,
    private router: Router,
    private translate: TranslateService
  ) {
  }

  getCustomer() {
    if (this.customer_id !== null) {
      this.isLoading = true;
      this.customerApi.get(this.customer_id).subscribe({
        next: async (res) => {
          console.log(res);
          this.customer = res;
          for (let key in res) {
  
            if (key == 'address' || key == 'billing_street' || key == 'shipping_street') {
              res[key] = res[key] ? res[key].replaceAll('<br />', '') : '';
            }
            if (key == 'show_primary_contact') {
              res[key] = res[key] == '0' ? false : true;
            }
            if (this.formGroup.controls[key]) {
              if (key != 'default_language') {
                this.formGroup.controls[key].setValue(res[key]);
              }
            }
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
    this.currency$ = this.currencyApi.getCurrenciesData().subscribe(res => {
      if (!res) {
        this.currencyApi.get().subscribe({
          next: response => {
            this.currencyApi.setCurrenciesData(response);
          }
        });
      } else {
        this.currencies.push(...res);
        this.currencies = this.currencies.reduce((result, obj) => {
          const data = {
            id: obj.id, 
            name: obj.name + ' ' + obj.symbol,
            symbol: obj.symbol
          }
          result.push(data);
          return result;
        }, []);
        // console.log('currenciesList =>', currenciesList);
        console.log(this.currencies);
        if (this.customer) {
          this.formGroup.controls.default_currency.setValue(this.customer.default_currency);
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
        if (this.customer) {
          this.formGroup.controls.country.setValue(this.customer.country);
          this.formGroup.controls.billing_country.setValue(this.customer.billing_country);
          this.formGroup.controls.shipping_country.setValue(this.customer.shipping_country);
        }
      }
    })

    this.language$ = this.countryApi.getLanguageData().subscribe(res => {
      if (!res) {
        this.countryApi.getLanguages().subscribe({
          next: async response => {
            this.countryApi.setLanguageData(response);
  
          }
        });
      } else {
        this.languages = res;
        if (this.customer) {
          console.log('customer available and get language testing ............')
          this.formGroup.controls.default_language.setValue(this.customer.default_language);
        }
      }
    })

    this.customerApi.get_groups().subscribe({
      next: (response: any) => {
        if(response.status != false){
          this.groups = response;
        }
  
        if (this.customer) {
          const groups_in = [];
          for (let group of this.customer.customer_groups) {
            groups_in.push(group.groupid);
          }
          this.formGroup.controls.groups_in.setValue(groups_in);
        }
      }
    });
  }

  ngOnInit() {
    this.getCustomer();

    this.formGroup = this.fb.group({
      show_primary_contact: [false],
      company: ['', [Validators.required]],
      vat: [''],
      phonenumber: [''],
      website: [''],
      groups_in: [''],
      default_currency: [''],
      default_language: [''],

      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: [''],

      billing_street: [''],
      billing_city: [''],
      billing_state: [''],
      billing_zip: [''],
      billing_country: [''],

      shipping_street: [''],
      shipping_city: [''],
      shipping_state: [''],
      shipping_zip: [''],
      shipping_country: [''],
      update_all_other_transactions: [false],
      update_credit_notes: [false],
      custom_fields: this.fb.group({
        customers: this.fb.group([])
      })
    });
  }
  ngOnDestroy() {
    this.language$.unsubscribe();
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  updateCustomer() {
    this.submitting = true;
    this.customerApi.update(this.customer_id, this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          this.router.navigate(['admin/customers/view/', this.customer_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createCustomer() {
    this.submitting = true;
    this.customerApi.store(this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          this.router.navigate(['admin/customers/view/', response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false; 
      }
    });
  }
}
