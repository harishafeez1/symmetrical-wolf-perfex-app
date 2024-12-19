import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AccordionGroupCustomEvent, IonItemSliding, ModalController, ToggleCustomEvent } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CustomerApiService, STORAGE_CUSTOMER_KEY } from 'src/app/services/customer-api.service';
import { StorageService } from 'src/app/services/storage.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { SortingPage } from '../modals/sorting/sorting.page';
import { Sorting } from 'src/app/interfaces/sorting';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { CommonApiService } from 'src/app/services/common-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit, OnDestroy {
  // @ViewChild('slides', { static: true }) slides: IonSlides;
  account_switched: EventListener;

  customers = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  isMpcLoading = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;

  isFiltered = false;
  appliedFilters:any = {
    groups_in: '',
    invoice_statuses: '',
    estimate_statuses: '',
    project_statuses: '',
    proposal_statuses: ''
  };
  private get_customer: Subscription;


  summary: any;

  constructor(
    public customerApi: CustomerApiService,
    private commonApi: CommonApiService,
    private router: Router,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private storage: StorageService,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.customers = [];
    const customer_storage_data = await this.storage.getObject(STORAGE_CUSTOMER_KEY);
    console.log('customer_storage_data =>', customer_storage_data);
    if (customer_storage_data == null) {
      this.getCustomers(true);
    } else {
      this.customers = customer_storage_data;
      this.isSyncing = true;
      this.getCustomers(true, false, false);
    }
    this.getSummary();
  }

  getCustomers(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.customerApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res:any) => {
        if (this.isSyncing) {
          this.customers = [];
          this.isSyncing = false;
        }
        if(res.status !== false){
          this.customers.push(...res);
          this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
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

  searchCustomers(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.customers = [];
    this.infiniteScroll = true;
    this.getCustomers(true, false, true);
  }

  getSummary() {
    this.commonApi.customers_summary().subscribe({
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

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.infiniteScroll = true;
    this.getCustomers(true, false, false);
  }

  loadMoreCustomers(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
    this.getCustomers(false, event, false);
    }else{
      event.target.complete();
    }
    /* if(!this.customers.length){
      event.target.complete();
    } */
    
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getCustomers(true, event,false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.customers = [];
      this.infiniteScroll = true;
      this.getCustomers(true);
    }
  }
  view(userId: any, customer) {
    const extras: NavigationExtras = {
      state: customer
    };
    this.router.navigate(['admin/customers/view/', userId], extras);
  }

  edit(userId: any) {
    this.router.navigateByUrl('admin/customers/edit/' + userId);
  }
  addCustomer() {
    this.router.navigateByUrl('admin/customers/create');
  }
  async delete(userId: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    console.log('confirmItem =>', confirmItem);
    if(confirmItem){
      this.customerApi.delete(userId).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.customers.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
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
      if (modalFilters !== null && modalFilters?.data) {
        this.isFiltered = false;
        this.appliedFilters = modalFilters.data;
        console.log('this.appliedFilters : ', this.appliedFilters);
        if(modalFilters.data.active == null || modalFilters.data.active == 'all'){
          delete this.appliedFilters.active;
        }
        if (
          (this.appliedFilters.active && this.appliedFilters.active != '') ||
          (this.appliedFilters.groups_in && this.appliedFilters.groups_in != '') ||
          (this.appliedFilters.invoice_statuses && this.appliedFilters.invoice_statuses != '') ||
          (this.appliedFilters.project_statuses && this.appliedFilters.project_statuses != '') ||
          (this.appliedFilters.estimate_statuses && this.appliedFilters.estimate_statuses != '') ||
          (this.appliedFilters.proposal_statuses && this.appliedFilters.proposal_statuses != '')
        ) {
          this.isFiltered = true;
        }
        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.customers = [];
        this.infiniteScroll = true;
        this.getCustomers(true);
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
    this.get_customer = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_customer') {
        const checkCustomer = this.customers.find(customer => customer.userid == response.data.userid);
        if (checkCustomer) {
          this.customers = this.customers.map(customer => {
            if (customer.userid === response.data.userid) {
              return response.data;
            }
            return customer;
          });
        } else {
          this.customers.unshift(response.data);
        }
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
    this.get_customer.unsubscribe();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

  customerChangeStatus(event, index, customer: any) {
    this.isMpcLoading = true;
    const status = customer.active == 0 ? 1 : 0;
    this.customerApi.changeStatus(customer?.userid, status).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.customers[index].active = status;
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isMpcLoading = false;
      }, error: () => {
        this.isMpcLoading = false
      }
    });
  }
}
