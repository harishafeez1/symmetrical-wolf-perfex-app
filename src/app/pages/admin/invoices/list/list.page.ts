import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
// import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { tr } from 'date-fns/locale';
import { Subscription } from 'rxjs';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { InvoiceApiService, STORAGE_INVOICE_KEY } from 'src/app/services/invoice-api.service';
import { StorageService } from 'src/app/services/storage.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { Sorting } from 'src/app/interfaces/sorting';
import { CommonApiService } from 'src/app/services/common-api.service';
// import * as echarts from 'echarts';
@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  // @ViewChild('slides', { static: true }) slides: IonSlides;
  invoices = [];

  account_switched: EventListener;

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

  

  summary: any;
  statusChartOptions = this.invoiceHelper.eChatOptions();
  chartMergeOptions: any = {};
  isDark = false;

  constructor(
    public invoiceApi: InvoiceApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private invoiceHelper: InvoicesHelper,
    private storage: StorageService,
    private router: Router
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.invoices = [];
    const storage_data = await this.storage.getObject(STORAGE_INVOICE_KEY);
    if (storage_data == null || storage_data?.status == false) {
      this.getInvoices(true);
    } else {
      this.invoices = storage_data;
      this.isSyncing = true;
      this.getInvoices(true, false, false);
    }
    this.getSummary();
  }

  getInvoices(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.invoiceApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.invoices = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.invoices.push(...res);
          this.invoices = [...new Map(this.invoices.map(item => [item?.id, item])).values()];
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

  searchInvoices(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.invoices = [];
    this.infiniteScroll = true;
    this.getInvoices(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.infiniteScroll = true;
    this.getInvoices(true, false, false);
  }

  loadMoreInvoices(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getInvoices(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getInvoices(true, event,false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.invoices = [];
      this.infiniteScroll = true;
      this.getInvoices(true);
    }
  }

  getSummary() {
    this.commonApi.invoices_summary().subscribe({
      next: (res: any) => {
        this.summary = res;
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

  view(id: any, invoice: any) {
    const extras: NavigationExtras = {
      state: invoice
    };
    this.router.navigate(['admin/invoices/view', id], extras);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/invoices/edit/', id]);
  }

  addInvoice() {
    this.navCtrl.navigateForward(['admin/invoices/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.invoiceApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.invoices.splice(index, 1); //remove from list
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

        if (this.appliedFilters.status.length !== 0 || (this.appliedFilters.sale_agent !== null && this.appliedFilters.sale_agent !== '')) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.invoices = [];
        this.infiniteScroll = true;
        this.getInvoices(true);
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

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
