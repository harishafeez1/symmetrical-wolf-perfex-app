import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
// import { tr } from 'date-fns/locale';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LeadApiService, STORAGE_LEAD_KEY, STORAGE_LEAD_STATUS_KEY } from 'src/app/services/lead-api.service';
import { StorageService } from 'src/app/services/storage.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { Sorting } from 'src/app/interfaces/sorting';
import { CommonApiService } from 'src/app/services/common-api.service';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  // @ViewChild('slides', { static: true }) slides: IonSlides;
  
  account_switched: EventListener;

  leads = [];

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
    source: '',
    assigned: ''
  };
  statuses = [];

  

  summary: any;
  private get_lead: Subscription;

  constructor(
    public leadApi: LeadApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private invoiceHelper: InvoicesHelper,
    private storage: StorageService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.leads = [];
    const storage_data = await this.storage.getObject(STORAGE_LEAD_KEY);
    if (storage_data == null) {
      this.getLeads(true);
    } else {
      this.leads = storage_data;
      this.isSyncing = true;
      this.getLeads(true, false, false);
    }
    this.getSummary();
  }

  getLeads(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.leadApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.leads = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.leads.push(...res);
          this.leads = [...new Map(this.leads.map(item => [item?.id, item])).values()];
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

  searchLeads(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.leads = [];
    this.getLeads(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getLeads(true, false, false);
  }

  loadMoreLeads(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getLeads(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getLeads(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.leads = [];
      this.infiniteScroll = true;
      this.getLeads(true);
    }
  }

  getSummary() {
    this.commonApi.leads_summary().subscribe({
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

  view(id: any, lead: any) {
    const extras: NavigationExtras = {
      state: lead
    };
    this.router.navigate(['admin/leads/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/leads/edit/', id]);
  }

  addLead() {
    this.navCtrl.navigateForward(['admin/leads/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.leadApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.leads.splice(index, 1); //remove from list
          itemSlide.close();
        }
      }
    });
  }

  getContrastYIQ(hexcolor) {
    hexcolor = hexcolor ?  hexcolor.replace("#", "") : '';
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
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

        if (this.appliedFilters.status.length !== 0 || this.appliedFilters.source.length !== 0 || this.appliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.leads = [];
        this.getLeads(true);
      }
    });
    return await modal.present();
  }

  ngOnInit(): void {
    this.get_lead = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_lead') {
        const checkLead = this.leads.find(lead => lead.id == response.data.id);
        if (checkLead) {
          this.leads = this.leads.map(lead => {
            if (lead.id === response.data.id) {
              return response.data;
            }
            return lead;
          });
        } else {
          this.leads.unshift(response.data);
        }
      }
    });
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);
    window.addEventListener("admin:lead_deleted", this.account_switched);
  }

  ngOnDestroy(): void {
    this.get_lead.unsubscribe();
    window.removeEventListener("admin:account_switched", this.account_switched);
    window.removeEventListener("admin:lead_deleted", this.account_switched);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
