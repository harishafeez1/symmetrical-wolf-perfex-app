import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { CreditNotesHelper } from 'src/app/classes/credit-notes-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CreditNoteApiService, STORAGE_CREDIT_NOTE_KEY } from 'src/app/services/credit-note-api.service';
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

  credit_notes = [];

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
    public creditNoteApi: CreditNoteApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private crediNoteHelper: CreditNotesHelper,
    private storage: StorageService,
    private router: Router
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.credit_notes = [];
    const storage_data = await this.storage.getObject(STORAGE_CREDIT_NOTE_KEY);
    if (storage_data == null || storage_data?.status == false) {
      this.getCreditNotes(true);
    } else {
      this.credit_notes = storage_data;
      this.isSyncing = true;
      this.getCreditNotes(true, false, false);
    }
  }

  getCreditNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.creditNoteApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.credit_notes = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.credit_notes.push(...res);
          this.credit_notes = [...new Map(this.credit_notes.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.limit && refresh == false) {
          // event.target.disabled = true;
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

  searchCreditNotes(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.credit_notes = [];
    this.getCreditNotes(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getCreditNotes(true, false, false);
  }

  loadMoreCreditNotes(event) {
    if(this.infiniteScroll) {
       this.offset += this.limit;
    this.getCreditNotes(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getCreditNotes(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.credit_notes = [];
      this.infiniteScroll = true;
      this.getCreditNotes(true);
    }
  }

  view(id: any, credit_note: any) {
    const extras: NavigationExtras = {
      state: credit_note
    };
    this.router.navigate(['admin/credit_notes/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/credit_notes/edit/', id]);
  }

  addCreditNote() {
    this.navCtrl.navigateForward(['admin/credit_notes/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.creditNoteApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status != false) {
          this.credit_notes.splice(index, 1); //remove from list
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
        this.credit_notes = [];
        this.getCreditNotes(true);
      }
    });
    return await modal.present();
  }

  getStatusNameByStatusId(status) {
    return this.crediNoteHelper.get_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.crediNoteHelper.get_status_by_id(status).color;
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
