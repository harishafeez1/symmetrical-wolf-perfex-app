import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonItemSliding, ModalController, NavController } from '@ionic/angular';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ProjectApiService, STORAGE_PROJECT_KEY } from 'src/app/services/project-api.service';
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

  projects = [];

  isLoading = false;
  isSyncing = false;
  isSearching = false;
  infiniteScroll = true;

  offset = 0;
  limit = 20;
  search: any;
  isFiltered = false;
  appliedFilters = {
    status: ''
  };

  

  summary: any;

  constructor(
    public projectApi: ProjectApiService,
    private commonApi: CommonApiService,
    private navCtrl: NavController,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    public projectHelper: ProjectsHelper,
    private storage: StorageService,
    private router: Router
  ) {
    this.getFromStorage();
   
  }

  async getFromStorage() {
    this.isLoading = true;
    this.projects = [];
    const storage_data = await this.storage.getObject(STORAGE_PROJECT_KEY);
    if (storage_data == null) {
      this.getProjects(true);
    } else {
      this.projects = storage_data;
      this.isSyncing = true;
      this.getProjects(true, false, false);
    }
    this.getSummary();
  }

  getProjects(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.projectApi.get('', this.search, this.offset, this.limit, this.appliedFilters).subscribe({
      next: (res: any) => {
        if (this.isSyncing) {
          this.projects = [];
          this.isSyncing = false;
        }
  
        if (res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
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

  searchProjects(event) {
    console.log('event', event.detail.value);
    this.search = event.detail.value;
    this.offset = 0;
    this.projects = [];
    this.getProjects(true, false, true);
  }

  openSearch() {
    console.log(this.isSearching);
    this.isSearching = !this.isSearching;
    this.search = '';
    this.offset = 0;
    this.getProjects(true, false, false);
  }

  getStatusNameByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).color;
  }

  loadMoreProjects(event) {
    if (this.infiniteScroll) {
      this.offset += this.limit;
      console.log('offset:', this.offset);
      this.getProjects(false, event, false);
    } else {
      event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.offset = 0;
    this.isSyncing = true;
    this.infiniteScroll = true;
    this.getProjects(true, event, false);
  }

  onSortingChange(sort: any) {
    if (sort) {
      this.offset = 0;
      this.projects = [];
      this.infiniteScroll = true;
      this.getProjects(true);
    }
  }

  getSummary() {
    this.commonApi.projects_summary().subscribe({
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

  view(id: any, project: any) {
    const extras: NavigationExtras = {
      state: project
    };
    this.router.navigate(['admin/projects/view', id], extras);
    // this.router.navigateByUrl('/' + id);
  }

  edit(id: any) {
    this.navCtrl.navigateForward(['admin/projects/edit/', id]);
  }

  addProject() {
    this.navCtrl.navigateForward(['admin/projects/create']);
  }

  delete(id: any, index: any, itemSlide: IonItemSliding) {
    this.projectApi.delete(id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.projects.splice(index, 1); //remove from list
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

        if (this.appliedFilters.status.length !== 0) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.offset = 0;
        this.projects = [];
        this.getProjects(true);
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
