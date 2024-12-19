import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ContractHelper } from 'src/app/classes/contract-helper';
import { Sorting } from 'src/app/interfaces/sorting';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ContractApiService, STORAGE_CONTRACT_KEY } from 'src/app/services/contract-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { SharedService } from 'src/app/services/shared.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  account_switched: EventListener;

  contracts = [];

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
  private get_contract: Subscription;

  constructor(
    public contractApi: ContractApiService,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public contractHelper: ContractHelper,
    private storage: StorageService,
    private router: Router,
    private mpcAlert: MpcAlertService,
    private sharedService: SharedService,
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.contracts = [];
    const storage_data = await this.storage.getObject(STORAGE_CONTRACT_KEY);
    if (storage_data == null || storage_data?.status == false) {
      this.getContracts(true);
    } else {
      this.contracts = storage_data;
      this.isSyncing = true;
      this.getContracts(true, false, false);
    }
  }

  getContracts(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.contractApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.contracts = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.contracts.push(...res);
          this.contracts = [...new Map(this.contracts.map(item => [item?.id, item])).values()];
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

  searchContracts(event) {
    this.search = event.detail.value;
    this.offset = 0;
    this.contracts = [];
    this.infiniteScroll = true;
    this.getContracts(true, false, true);
  }

  openSearch() {
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.infiniteScroll = true;
    this.getContracts(true, false, false);
  }

  loadMoreContracts(event) {
    if(this.infiniteScroll) {
      this.offset += this.limit;
      this.getContracts(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true; 
    this.infiniteScroll = true;
    this.getContracts(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.contracts = [];
      this.infiniteScroll = true;
      this.getContracts(true);
    }
  }

  view(id: any, contract: any) {
    const extras: NavigationExtras = {
      state: contract
    };
    this.router.navigate(['admin/contracts/view', id], extras);
  }

  edit(id: any) {
    this.router.navigate(['admin/contracts/edit/', id]);
  }

  addContract() {
    this.router.navigate(['admin/contracts/create']);
  }

  async delete(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.contractApi.delete(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.contracts.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {}
      });
    }
  }

  async openFilters() {
    console.log('open Filters');
    /* const modal = await this.modalCtrl.create({
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
        this.contracts = [];
        this.infiniteScroll = true;
        this.getContracts(true);
      }
    });
    return await modal.present(); */
  }

  ngOnInit(): void {
    console.log('contractApi =>', this.contractApi);
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);
    this.get_contract = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_contract') {
        const checkContract = this.contracts.find(contract => contract.id == response.data.id);
        if (checkContract) {
          this.contracts = this.contracts.map(contract => {
            if (contract.id === response.data.id) {
              return response.data;
            }
            return contract;
          });
        } else {
          this.contracts.unshift(response.data);
        }
      }
    });

  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
    this.get_contract.unsubscribe();
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

}
