import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Sorting } from 'src/app/interfaces/sorting';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { SharedService } from 'src/app/services/shared.service';
import { StaffApiService, STORAGE_STAFF_KEY } from 'src/app/services/staff-api.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit,OnDestroy {
  account_switched: EventListener;

  staffs = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  private get_staff: Subscription;
  userData: any;
  toggleValue: boolean = false; // Initial value of the toggle
  toggleDisabled: boolean = true; // Initial disable state of the toggle
  constructor(
    public staffApi: StaffApiService,
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
    this.staffs = [];
    const staff_storage_data = await this.storage.getObject(STORAGE_STAFF_KEY);
    if (staff_storage_data == null) {
      this.getStaffs(true);
    } else {
      this.staffs = staff_storage_data;
      this.isSyncing = true;
      this.getStaffs(true, false, false);
    }
  }

  getStaffs(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.staffApi.get('', this.search, this.offset, this.limit).subscribe({
      next: (res:any) => {
        if (this.isSyncing) {
          this.staffs = [];
          this.isSyncing = false;
        }
        
        if(res.status !== false){
          this.staffs.push(...res);
          this.staffs = [...new Map(this.staffs.map(item => [item?.staffid, item])).values()];
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

  searchStaffs(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.staffs = [];
    this.getStaffs(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getStaffs(true, false, false);
  }

  loadMoreStaffs(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      // console.log('offset:', this.offset);
      this.getStaffs(false, event,false);
    } else {
      event.target.complete();
    }

  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getStaffs(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.staffs = [];
      this.infiniteScroll = true;
      this.getStaffs(true);
    }
  }

  view(userid: any, staff) {
    const extras: NavigationExtras = {
      state: staff,
      queryParams: {page: 'staff'}
    };
    this.router.navigate(['admin/staffs/view/', userid], extras);
  }

  async delete(userid: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.staffApi.delete(userid).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.staffs.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }
      });
    }
  }

  ngOnInit(): void {
    this.userData= this.authService.auth ? this.authService.auth.data : null;
    console.log('this.userData =>', this.userData);
    this.account_switched = () => {
      this.offset = 0;
      this.isLoading = true;
      this.getFromStorage();
    };
    window.addEventListener("admin:account_switched", this.account_switched);

    this.get_staff = this.sharedService.eventObservable$.subscribe((response) => {
      if (response.event === 'admin:get_staff') {
        const checkStaff =  this.staffs.find(staff => staff.staffid == response.data.staffid);
        if(checkStaff){
          this.staffs = this.staffs.map(staff => {
            if (staff.staffid === response.data.staffid) {
              return response.data;
            }
            return staff;
          });
        }else{
          this.staffs.unshift(response.data);
        }
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("admin:account_switched", this.account_switched);
    this.get_staff.unsubscribe();
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
  
  staffChangeStatus(event: any, staffId: any) {
    event.stopPropagation();
    console.log('event =>', event.target.checked);
    console.log('staffId =>', staffId);
    const status = event.target.checked ? 1 : 0;
    this.staffApi.changeStatus(staffId, status).subscribe({
      next: (res: any) => {
        if (res.status === true) {
          this.mpcToast.show(res.message);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }
    });
  }
}
