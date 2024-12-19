import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { Sorting } from 'src/app/interfaces/sorting';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ExpenseApiService, STORAGE_EXPENSE_KEY } from 'src/app/services/expense-api.service';
import { ItemApiService, STORAGE_ITEM_KEY } from 'src/app/services/item-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  account_switched: EventListener;

  invoice_items = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  constructor(
    public itemApi: ItemApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private storage: StorageService,
    private router: Router,
    private mpcAlert: MpcAlertService
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.invoice_items = [];
    const storage_data = await this.storage.getObject(STORAGE_ITEM_KEY);
    if (storage_data == null) {
      this.getInvoiceItems(true);
    } else {
      this.invoice_items = storage_data;
      this.isSyncing = true;
      this.getInvoiceItems(true, false, false);
    }
  }

  getInvoiceItems(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.itemApi.get('', this.search, this.offset, this.limit).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.invoice_items = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.invoice_items.push(...res);
          this.invoice_items = [...new Map(this.invoice_items.map(item => [item?.id, item])).values()];
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

  searchInvoiceItems(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.invoice_items = [];
    this.getInvoiceItems(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getInvoiceItems(true, false, false);
  }

  loadMoreInvoiceItems(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getInvoiceItems(false, event, false);
    } else {
      event.target.complete();
    }

  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getInvoiceItems(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.invoice_items = [];
      this.infiniteScroll = true;
      this.getInvoiceItems(true);
    }
  }

  view(id: any, expense: any) {
    const extras: NavigationExtras = {
      state: expense
    };
    this.router.navigate(['admin/invoice_items/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  copy(id: any) {
    this.itemApi.copy(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.navCtrl.navigateForward(['admin/invoice_items/edit/', res.insert_id]);
        }
      }
    });
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/invoice_items/edit/', id]);
  }

  addInvoiceItem() {
    this.navCtrl.navigateForward(['admin/invoice_items/create']);
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if (confirmItem) {
      this.itemApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.invoice_items.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }
      });
    }
  }

  ngOnInit(): void {
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);

    window.addEventListener("admin:invoice_item_created", () => {
      this.getFromStorage();
    });

    window.addEventListener("admin:invoice_item_updated", () => {
      this.getFromStorage();
    });
  }

  ngOnDestroy(): void {
    console.log('gonna distroy');
    window.removeEventListener("admin:account_switched", this.account_switched);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
