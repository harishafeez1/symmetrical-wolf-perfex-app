import { Component, OnInit, ViewChild } from '@angular/core';
import { IonItemSliding, IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { StorageService } from 'src/app/services/storage.service';
import { STORAGE_SUBSCRIPTION_KEY, SubscriptionApiService } from 'src/app/services/subscription-api.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { Sorting } from 'src/app/interfaces/sorting';
import { CommonApiService } from 'src/app/services/common-api.service';
import { SubscriptionsHelper } from 'src/app/classes/subscriptions-helper';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  // @ViewChild('slides', { static: true }) slides: IonSlides;
  account_switched: EventListener;

  subscriptions = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  isFiltered = false;
  appliedFilters = {
    status: ''
  };
  statuses = [];

 /*  slideOpts = {
    slidesPerView: 'auto',
    spaceBetween: 20,
    pagination: false,
    freeMode: true
  }; */

  summary: any;

  constructor(
    public subscriptionApi: SubscriptionApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private storage: StorageService,
    private routerOutlet: IonRouterOutlet,
    public subscriptionHelper: SubscriptionsHelper
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.subscriptions = [];
    const storage_data = await this.storage.getObject(STORAGE_SUBSCRIPTION_KEY);
    if (storage_data == null) {
      this.getSubscriptions(true);
    } else {
      this.subscriptions = storage_data;
      this.isSyncing = true;
      this.getSubscriptions(true, false, false);
    }
    this.getSummary();
  }

  getSubscriptions(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.subscriptionApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.subscriptions = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.subscriptions.push(...res);
          this.subscriptions = [...new Map(this.subscriptions.map(item => [item?.id, item])).values()];
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

  searchSubscriptions(event) {
    this.search = event.detail.value;
    this.offset = 0;
    this.subscriptions = [];
    this.getSubscriptions(true, false, true);
  }

  openSearch() {
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getSubscriptions(true, false, false);
  }

  loadMoreSubscriptions(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getSubscriptions(false, event, false);
    } else {
      event.target.complete();
    }

  }

  doRefresh(event: any) {
    this.offset = 0;
    // this.subscriptions = [];
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getSubscriptions(true, event, true);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.subscriptions = [];
      this.infiniteScroll = true;
      this.getSubscriptions(true);
    }
  }

  getSummary() {
    this.commonApi.subscriptions_summary().subscribe({
      next: (res) => {
        this.summary = res;
      }
    });
  }

  onAccordionChange() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // this.slides.update();
      });
    });
  }

  addSubscription() {
    this.navCtrl.navigateForward(['admin/subscriptions/create']);
  }

  async openFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: FiltersPage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        appliedFilters: this.appliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.appliedFilters = modalFilters.data;

        if (this.appliedFilters.status.length !== 0) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.subscriptions = [];
        this.getSubscriptions(true);
      }
    });
    return await modal.present();
  }

  ngOnInit(): void {
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
  }
}
