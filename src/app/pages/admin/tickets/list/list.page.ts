import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { StorageService } from 'src/app/services/storage.service';
import { STORAGE_TICKET_KEY, TicketApiService } from 'src/app/services/ticket-api.service';
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

  tickets = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  isFiltered = false;
  appliedFilters = {
    status: [],
    assigned: []
  };
  statuses = [];

  

  summary: any;

  constructor(
    public ticketApi: TicketApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private storage: StorageService,
    private router: Router,
    private routerOutlet: IonRouterOutlet
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.tickets = [];
    const storage_data = await this.storage.getObject(STORAGE_TICKET_KEY);
    if (storage_data == null) {
      this.getTickets(true);
    } else {
      this.tickets = storage_data;
      this.isSyncing = true;
      this.getTickets(true, false, false);
    }
    this.getSummary();
  }

  getTickets(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.ticketApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.tickets = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.tickets.push(...res);
          this.tickets = [...new Map(this.tickets.map(item => [item?.ticketid, item])).values()];
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

  searchTickets(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.tickets = [];
    this.getTickets(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getTickets(true, false, false);
  }

  loadMoreTickets(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getTickets(false, event, false);
    } else {
      event.target.complete();
    }

  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getTickets(true, event,false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.tickets = [];
      this.infiniteScroll = true;
      this.getTickets(true);
    }
  }

  getSummary() {
    this.commonApi.tickets_summary().subscribe({
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

  view(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tickets/view', id], extras);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/tickets/edit/', id]);
  }

  addTicket() {
    this.navCtrl.navigateForward(['admin/tickets/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.ticketApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.tickets.splice(index, 1); //remove from list
          itemSlide.close();
        }
      }
    });
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

        if (this.appliedFilters.status.length !== 0 || this.appliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.tickets = [];
        this.getTickets(true);
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
