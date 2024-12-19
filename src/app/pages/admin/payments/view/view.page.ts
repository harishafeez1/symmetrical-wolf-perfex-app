import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { STATUS_PAID, STATUS_CANCELLED } from 'src/app/classes/invoices-helper';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { PaymentApiService } from 'src/app/services/payment-api.service';
import { FileOpener } from '@capacitor-community/file-opener';
import { ModalController } from '@ionic/angular';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdatePaymentPage } from 'src/app/pages/admin/payments/create/create.page';
import { Subscription } from 'rxjs';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit,OnDestroy {
  payment_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() paymentId: any;
  @Input() type = '';
  @Input() paymentInfo:any;
  STATUS_PAID = STATUS_PAID;
  STATUS_CANCELLED = STATUS_CANCELLED;
  payment: any;
  countries = [];
  currencies = [];
  isLoading = false;
  private country$: Subscription;
  private currency$: Subscription;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paymentApi: PaymentApiService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private modalCtrl: ModalController,
    private sharedService: SharedService,
    private animationService: AnimationService,
  ) {
    
  }
  ngOnInit() {
    this.payment_id = this.payment_id ?? this.paymentId;
    this.activatedRoute.queryParams.subscribe((params) => {
      if(this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.payment = this.router.getCurrentNavigation().extras.state;
        this.isLoading = false;
      } else {
        if(this.type === 'modal' && this.paymentInfo){
          this.payment = this.paymentInfo
        }else{
          this.getPayment();
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
  getPayment(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.paymentApi.get(this.payment_id).subscribe({
      next: (res) => {
        this.payment = res;
        this.sharedService.dispatchEvent({
          event: 'admin:get_payment',
          data: this.payment
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

  getCountryNameById(country_id: Number) {
    for(let country of this.countries) {
      if(country.country_id == country_id) {
        return country.short_name;
      }
    }
    return '';
  }

  getCurrencyNameById(currency_id: Number) {
    for(let currency of this.currencies) {
      if(currency.id == currency_id) {
        return currency.name + ' <small>' + currency.symbol + '</small>';
      }
    }
    return 'System Default';
  }

 

  async edit(id: any) {
    if(this.type === 'modal'){
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdatePaymentPage,
        breakpoints: [0, 0.25, 0.5, 0.75,0.90, 1.0],
        initialBreakpoint: 1.0,
        showBackdrop: false,
        mode: 'ios',
        componentProps: {
          paymentId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
  
      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    }else{
      this.router.navigate(['admin/payments/edit/', id]);
    }
  }

  doPaymentRefresh(event: any, tab = '') {
    this.getPayment(true, event);
  }

  getPDF(action = 'view') {
    this.paymentApi.getPDF(this.payment_id).subscribe({
      next: async (response: any) => {
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'payment_' + this.payment_id + '.pdf',
            data: response.pdf,
            directory: Directory.Documents
          });
  
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/pdf',
            openWithDefault: action == 'view' ? false : true
          });
        }
      }
    });
  }

close(){
  this.modalCtrl.dismiss(false, 'dismiss');
}
goToPage(page){
  if(this.type == 'modal'){
    this.close();
  }
  this.router.navigate([`${page}`]);
}
  
}
