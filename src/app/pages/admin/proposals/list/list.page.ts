import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProposalApiService, STORAGE_PROPOSAL_KEY } from 'src/app/services/proposal-api.service';
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
  refresh_data: EventListener;

  proposals = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;

  offset = 0;
  limit = 20;
  search: any;
  isFiltered = false;
  appliedFilters = {
    status: '',
    sale_agent: ''
  };

  infiniteScroll = true;

  constructor(
    public proposalApi: ProposalApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private proposalHelper: ProposalsHelper,
    private storage: StorageService,
    private router: Router
  ) {
    this.getFromStorage();
  }

  ngOnInit(): void {
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    this.refresh_data = () => {
      this.isSyncing = true;
      this.getProposals(true, false, false);
    }

    window.addEventListener("admin:account_switched", this.account_switched);
    window.addEventListener("admin:proposal_deleted", this.refresh_data);
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched); 
    window.removeEventListener("admin:proposal_deleted", this.refresh_data); 
  }


  async getFromStorage() {
    this.isLoading = true;
    this.proposals = [];
    const storage_data = await this.storage.getObject(STORAGE_PROPOSAL_KEY);
    if (storage_data == null || storage_data?.status == false) {
      this.getProposals(true);
    } else {
      this.proposals = storage_data;
      this.isSyncing = true;
      this.getProposals(true, false, false);
    }
  }

  getProposals(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.proposalApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.proposals = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.proposals.push(...res);
          this.proposals = [...new Map(this.proposals.map(item => [item?.id, item])).values()];
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

  searchProposals(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.proposals = [];
    this.infiniteScroll = true;
    this.getProposals(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.infiniteScroll = true;
    this.getProposals(true, false, false);
  }

  loadMoreProposals(event) {
    if(this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getProposals(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getProposals(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.proposals = [];
      this.infiniteScroll = true;
      this.getProposals(true);
    }
  }

  view(id: any, proposal: any) {
    const extras: NavigationExtras = {
      state: proposal
    };
    this.router.navigate(['admin/proposals/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/proposals/edit/', id]);
  }

  addProposal() {
    this.navCtrl.navigateForward(['admin/proposals/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.proposalApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.proposals.splice(index, 1); //remove from list
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
        this.proposals = [];
        this.infiniteScroll = true;
        this.getProposals(true);
      }
    });
    return await modal.present();
  }


  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
