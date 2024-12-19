import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ExpenseApiService, STORAGE_EXPENSE_KEY } from 'src/app/services/expense-api.service';
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

  expenses = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  isFiltered = false;
  appliedFilters = {
    expense_categories: '',
    expense_months: '',
    expense: [],
    paymentmode: []
  };

  

  summary: any;

  constructor(
    public expenseApi: ExpenseApiService,
    private commonApi: CommonApiService,
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
    this.expenses = [];
    const storage_data = await this.storage.getObject(STORAGE_EXPENSE_KEY);
    if (storage_data == null || storage_data?.status == false) {
      this.getExpenses(true);
    } else {
      this.expenses = storage_data;
      this.isSyncing = true;
      this.getExpenses(true, false, false);
    }
    this.getSummary();
  }

  getExpenses(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.expenseApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.expenses = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.expenses.push(...res);
          this.expenses = [...new Map(this.expenses.map(item => [item?.expenseid, item])).values()];
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

  searchExpenses(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.expenses = [];
    this.getExpenses(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getExpenses(true, false, false);
  }

  loadMoreExpenses(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getExpenses(false, event, false);
    } else {
      event.target.complete();
    }

  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getExpenses(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.expenses = [];
      this.infiniteScroll = true;
      this.getExpenses(true);
    }
  }

  getSummary() {
    this.commonApi.expenses_summary().subscribe({
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

  view(id: any, expense: any) {
    const extras: NavigationExtras = {
      state: expense
    };
    this.router.navigate(['admin/expenses/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/expenses/edit/', id]);
  }

  addExpense() {
    this.navCtrl.navigateForward(['admin/expenses/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.expenseApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.expenses.splice(index, 1); //remove from list
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

        if (this.appliedFilters.expense_categories.length !== 0 || this.appliedFilters.expense_months !== null) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.expenses = [];
        this.getExpenses(true);
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
