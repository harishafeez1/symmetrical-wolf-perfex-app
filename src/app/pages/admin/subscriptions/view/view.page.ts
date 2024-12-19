import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { Browser } from '@capacitor/browser';
import { SubscriptionApiService } from 'src/app/services/subscription-api.service';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateSubscriptionPage } from 'src/app/pages/admin/subscriptions/create/create.page';
import { Subscription } from 'rxjs';
import { SubscriptionsHelper } from 'src/app/classes/subscriptions-helper';
import { AnimationService } from 'src/app/services/animation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  @Input() subscriptionId: any;
  @Input() type = '';
  @Input() subscriptionInfo: any;
  subscription_id = this.activatedRoute.snapshot.paramMap.get('id');
  selectedTab = 'subscription';
  subscription: any;
  countries = [];
  currencies = [];
  isLoading = true;
  isSearching = false;

  plans = [];
  stripe_tax_rates = [];
  private country$: Subscription;
  private currency$: Subscription;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subscriptionApi: SubscriptionApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    public authService: AuthenticationService,
    private modalCtrl: ModalController,
    private sharedService: SharedService,
    public subscriptionHelper: SubscriptionsHelper,
    private animationService: AnimationService,
    private actionSheetController: ActionSheetController,
    private translate: TranslateService,
  ) {

  }
  ngOnInit() {
    this.subscription_id = this.subscription_id ?? this.subscriptionId;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.subscription = this.router.getCurrentNavigation().extras.state;
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.subscriptionInfo) {
          this.subscription = this.subscriptionInfo;
          this.isLoading = false;
        } else {
          this.getSubscription();
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

    this.subscriptionApi.get_plans().subscribe({
      next: (response: any) => {
        if (response.status) {
          this.plans = response.plans.data;
          this.stripe_tax_rates = response.stripe_tax_rates.data;
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.country$.unsubscribe();
    this.currency$.unsubscribe();
  }

  async viewSubscription() {
    await Browser.open({ url: this.authService.BASE_URL + '/subscription/' + this.subscription?.hash });
  }

  getSubscription() {
    this.isLoading = true;
    this.subscriptionApi.get(this.subscription_id).subscribe({
      next: (response) => {
        this.subscription = response;
        this.isLoading = false;
        this.sharedService.dispatchEvent({
          event: 'admin:get_subscription',
          data: this.subscription
        });
        this.subscriptionApi.get_plans().subscribe({
          next: (response: any) => {
            if (response.status) {
              this.plans = response.plans.data;
              this.stripe_tax_rates = response.stripe_tax_rates.data;
            }
          }
        });
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getBillingPlanById(stripe_plan_id: String) {
    for (let plan of this.plans) {
      if (plan.id == stripe_plan_id) {
        return plan.nickname + ' <small>' + plan.subtext + '</small>';
      }
    }
    return '';
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


  addTask() {
    const extras: NavigationExtras = {
      state: {
        rel_type: 'subscription',
        rel_name: this.subscription.name,
        relational_values: {
          addedfrom: "1",
          id: this.subscription.id,
          name: `${this.subscription.name} (${this.subscription.subscription_name})`,
          subtext: '',
          type: 'subscription'
        },
        rel_id: this.subscription_id
      }
    };
    this.router.navigate(['admin/tasks/create'], extras);
  }

  doRefresh(event: any, tab = '') {
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    // if (event.detail.value == 'tasks' && this.tasks.length == 0) {
    //   this.getTasks(true);
    // }
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }
  async editSubscription(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateSubscriptionPage,
        breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
        initialBreakpoint: 1.0,
        showBackdrop: false,
        mode: 'ios',
        componentProps: {
          subscriptionId: id,
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
      this.router.navigate(['admin/subscriptions/edit/', id]);
    }
  }
  async openCancel() {
    let _buttons = [
      {
        text: this.translate.instant('cancel_immediately'),
        handler: () => {
          console.log('Cancel clicked');
          this.cancelSubscription('immediately');
        }
      },
      {
        text: this.translate.instant('cancel_at_end_of_billing_period'),
        handler: () => {
          console.log('Cancel clicked');
          this.cancelSubscription('at_period_end')
        }
      },
      {
        text: this.translate.instant('cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
    ];

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  cancelSubscription(type){
    this.isLoading = true;
    this.subscriptionApi.cancelSubscription(this.subscription_id, type).subscribe({
      next: (response) => {
        this.subscription = response;
        this.isLoading = false;
       this.getSubscription();
      }
    });
  }
}
