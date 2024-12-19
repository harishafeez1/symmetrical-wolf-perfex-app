import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PaymentApiService, STORAGE_PAYMENT_KEY } from 'src/app/services/payment-api.service';
import { StorageService } from 'src/app/services/storage.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { Sorting } from 'src/app/interfaces/sorting';
@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  account_switched: EventListener;

  payments = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  isFiltered = false;
  appliedFilters = {
    status: '',
    sale_agent: ''
  };

  constructor(
    public paymentApi: PaymentApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private storage: StorageService,
    private router: Router
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.payments = [];
    const storage_data = await this.storage.getObject(STORAGE_PAYMENT_KEY);
    console.log('storage_data =>', storage_data);
    if (storage_data == null) {
      this.getPayments(true);
    } else {
      this.payments = storage_data;
      this.isSyncing = true;
      this.getPayments(true, false, false);
    }
  }

  getPayments(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.paymentApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.payments = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.payments.push(...res);
          this.payments = [...new Map(this.payments.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.limit && refresh == false) {
          this.infiniteScroll = false;
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
        if (event && !refresh) {
          this.infiniteScroll = false; // Disable infinite scroll on error
        }
      }
    });
  }

  searchPayments(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.payments = [];
    this.getPayments(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getPayments(true, false, false);
  }

  loadMorePayments(event) {
    if(this.infiniteScroll) {
      this.offset += this.limit;
    console.log('offset:', this.offset);
    this.getPayments(false, event, false);
    } else {
      event.target.complete();
    }
    
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getPayments(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.payments = [];
      this.infiniteScroll = true;
      this.getPayments(true);
    }
  }
  async openFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: FiltersPage,
      componentProps: {
        appliedFilters: this.appliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.appliedFilters = modalFilters.data;

        if (this.appliedFilters.status.length !== 0 || this.appliedFilters.sale_agent !== null) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.payments = [];
        this.getPayments(true);
      }
    });
    return await modal.present();
  }

  ngOnInit(): void {
    this.account_switched = () => {
      this.offset = 0;
      console.log('payments');
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
