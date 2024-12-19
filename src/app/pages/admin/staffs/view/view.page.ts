import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreatePage as UpdateProjectPage } from '../../projects/create/create.page';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  staff_id = this.activatedRoute.snapshot.paramMap.get('id');
  selectedTab2 = 'profile';
  selectedTab = 'profile';
  staff: any;
  countries = [];
  isLoading = true;

  notes = [];

  projects = [];
  project_search = '';
  project_offset = 0;
  project_limit = 20;
  projectAppliedFilters = {
    staff_id: this.staff_id
  };
  private country$: Subscription;
  photoDataUrl = '';
  page = '';
  isSearching = false;
  isFiltered = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public staffApi: StaffApiService,
    private noteApi: NoteApiService,
    public projectApi: ProjectApiService,
    private countryApi: CountryApiService,
    private projectHelper: ProjectsHelper,
    public authService: AuthenticationService,
    public modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet,
    private sharedService: SharedService,
    private mpcToast: MpcToastService,
    private animationService: AnimationService,
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.staff = this.router.getCurrentNavigation().extras.state;
        this.page = this.router.getCurrentNavigation().extras.queryParams ? this.router.getCurrentNavigation().extras.queryParams.page : '';
        this.isLoading = false;
      } else {
        this.getStaff();
      }
    });
    this.country$ = this.countryApi.getCountriesData().subscribe(res => {
      if (!res) {
        this.countryApi.get().subscribe({
          next: async response => {
            this.countryApi.setCountriesData(response);
          }
        });
      } else {
        this.countries = res;
      }
    })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.country$.unsubscribe();
  }


  getStaff() {
    this.isLoading = true;
    this.staffApi.get(this.staff_id).subscribe({
      next: (res) => {
        this.staff = res;
        this.sharedService.dispatchEvent({
          event: 'admin:get_staff',
          data: this.staff
        });
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('staff', this.staff_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.notes = res;
        }
        if (event && res.length !== this.project_limit && refresh == false) {
          event.target.disabled = true;
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
      }
    });
  }

  getProjects(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.projectApi.get('', this.project_search, this.project_offset, this.project_limit, this.projectAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.projects.push(...res);
          this.projects = [...new Map(this.projects.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.project_limit && refresh == false) {
          event.target.disabled = true;
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
      }
    });
  }

  getCountryNameById(country_id: Number) {
    for (let country of this.countries) {
      if (country.country_id == country_id) {
        return country.short_name;
      }
    }
    return '';
  }

  getStatusNameByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.projectHelper.get_project_status_by_id(status).color;
  }



  async addEditNote(note: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateNotePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        rel_id: this.staff_id,
        rel_type: 'staff',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getStaff();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  view(id: any, data: any, tab = '') {
    const extras: NavigationExtras = {
      state: data
    };
    this.router.navigate(['admin/' + tab + 's/view', id], extras);
  }

  onSortingChange(sort: any, tab = '') {
    if (sort) {
      this[tab + '_offset'] = 0;
      this[tab + 's'] = [];
      this['get' + this.capitalizeFirstLetter(tab) + 's'](true);
    }
  }

  doRefresh(event: any, tab = '') {
    this[tab + '_offset'] = 0;
    this[tab + 's'] = [];
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  doSearch(event: any, tab = '') {
    console.log('event', event.detail.value);
    this[tab + '_search'] = event.detail.value;
    this[tab + '_offset'] = 0;
    this[tab + 's'] = [];
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, false, true);
  }

  loadMore(event: any, tab = '') {
    this[tab + '_offset'] += this[tab + '_limit'];
    console.log(tab + '_offset:', this[tab + '_offset']);
    this['get' + this.capitalizeFirstLetter(tab) + 's'](false, event, false);
  }

  delete(id: any, index: any, tab = '') {
    this[tab + 'Api'].delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this[tab + 's'].splice(index, 1); //remove from list
        }
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes();
    }

    if (event.detail.value == 'projects' && this.projects.length == 0) {
      this.getProjects(true);
    }
  }

  segmentChanged2(event: any) {
    this.selectedTab2 = event.detail.value;
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async updateProject(projectId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateProjectPage,
      mode: 'ios',
      componentProps: {
        projectId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
    });
    return await modal.present();
  }

  notesRefresh(event) {
    if (event) {
      this.getNotes();
    }
  }

  async chooseProfileImage() {
    console.log('select image');
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90,
      allowEditing: true,
    });
    this.photoDataUrl = image && image.dataUrl ? image.dataUrl : null;

    const file = this.dataUriToFile(this.photoDataUrl, Date.now() + '.png');
    console.log('file =>', file);
    if (file) {
      this.addAttachment(file);
    } else {
      this.mpcToast.show('please select image again', 'danger');
    }
  }

  dataUriToFile(dataUri: string, fileName: string): File | null {
    const regex = /^data:(.*?);base64,(.*)$/;
    const matches = dataUri.match(regex);

    if (!matches || matches.length !== 3) {
      console.error('Invalid data URI format');
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const byteString = atob(base64Data);
    const byteStringLength = byteString.length;
    const uint8Array = new Uint8Array(byteStringLength);

    for (let i = 0; i < byteStringLength; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  }

  addAttachment(file: File) {
    this.staffApi.addProfileImage(this.staff_id, file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          this.modalCtrl.dismiss(true);
          this.getStaff();
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }
  goToPage(){
  if(this.page === 'staff'){
    this.router.navigate(['/admin/staffs/list']);
  }else{
    this.router.navigate(['/admin/dashboard']);
  }
  }
}
