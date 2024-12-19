import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EstimateApiService, STORAGE_ESTIMATE_KEY } from 'src/app/services/estimate-api.service';
import { StorageService } from 'src/app/services/storage.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { Sorting } from 'src/app/interfaces/sorting';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  // @ViewChild('slides', { static: true }) slides: IonSlides;
  account_switched: EventListener;

  estimates = [];

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

  

  summary: any = [];
  statusChartOptions = this.estimateHelper.eChatOptions();
  chartMergeOptions: any = {};
  isDark = false;

  constructor(
    public estimateApi: EstimateApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public estimateHelper: EstimatesHelper,
    private storage: StorageService,
    private router: Router
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.estimates = [];
    const storage_data = await this.storage.getObject(STORAGE_ESTIMATE_KEY);
    if (storage_data == null || storage_data?.status == false) {
      this.getEstimates(true);
    } else {
      this.estimates = storage_data;
      this.isSyncing = true;
      this.getEstimates(true, false, false);
    }
    this.getSummary();
  }

  getEstimates(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.estimateApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.estimates = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.estimates.push(...res);
          this.estimates = [...new Map(this.estimates.map(item => [item?.id, item])).values()];
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

  searchEstimates(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.estimates = [];
    this.getEstimates(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getEstimates(true, false, false);
  }

  loadMoreEstimates(event) {
    if(this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getEstimates(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getEstimates(true, event,false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.estimates = [];
      this.infiniteScroll = true;
      this.getEstimates(true);
    }
  }

  getSummary() {
    this.commonApi.estimates_summary().subscribe({
      next: (res: any) => {
        this.summary = res?.stats;
        this.chartMergeOptions = res?.chart;
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

  view(id: any, estimate: any) {
    const extras: NavigationExtras = {
      state: estimate
    };
    this.router.navigate(['admin/estimates/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/estimates/edit/', id]);
  }

  addEstimate() {
    this.navCtrl.navigateForward(['admin/estimates/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.estimateApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.estimates.splice(index, 1); //remove from list
          itemSlide.close();
        }
      }
    });
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
        this.estimates = [];
        this.getEstimates(true);
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
    window.addEventListener("admin:refresh_data", this.account_switched);
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
    window.removeEventListener("admin:refresh_data", this.account_switched);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
