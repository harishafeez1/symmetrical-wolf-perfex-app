import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { StorageService } from 'src/app/services/storage.service';
import { STORAGE_TASK_KEY, TaskApiService } from 'src/app/services/task-api.service';
import { FiltersPage } from '../modals/filters/filters.page';
import { Sorting } from 'src/app/interfaces/sorting';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { CommonApiService } from 'src/app/services/common-api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  // @ViewChild('slides', { static: true }) slides: IonSlides;
  
  account_switched: EventListener;
  task_reload: EventListener;

  tasks = [];

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
    assigned: ''
  };
  statuses = [];

  

  summary: any;

  constructor(
    public taskApi: TaskApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public taskHelper: TasksHelper,
    private storage: StorageService,
    private router: Router,
    private routerOutlet: IonRouterOutlet
  ) {
    this.getFromStorage();
  }

  async getFromStorage() {
    this.isLoading = true;
    this.tasks = [];
    const storage_data = await this.storage.getObject(STORAGE_TASK_KEY);
    if (storage_data == null) {
      this.getTasks(true);
    } else {
      if(storage_data.status !== false) {
        this.tasks = storage_data;
      }

      this.isSyncing = true;
      this.getTasks(true, false, false);
    }
    this.getSummary();
  }

  getTasks(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.tasks = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.tasks.push(...res);
          this.tasks = [...new Map(this.tasks.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.limit && refresh == false) {
          this.infiniteScroll = false;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
  
      }, error: () => {
        if (event) {
          event.target.complete();
        }
        if (event && !refresh) {
          this.infiniteScroll = false; // Disable infinite scroll on error
        }
      }
    });
  }

  searchTasks(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.tasks = [];
    this.getTasks(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getTasks(true, false, false);
  }

  loadMoreTasks(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getTasks(false, event, false);
    } else {
      event.target.complete();
    }

  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getTasks(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.tasks = [];
      this.infiniteScroll = true;
      this.getTasks(true);
    }
  }

  getSummary() {
    this.commonApi.tasks_summary().subscribe({
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

  addTask() {
    this.navCtrl.navigateForward(['admin/tasks/create']);
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
        this.tasks = [];
        this.getTasks(true);
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
}
