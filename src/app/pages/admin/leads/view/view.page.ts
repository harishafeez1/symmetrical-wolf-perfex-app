import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { formatDistance, format, parseISO } from 'date-fns';
import { TaskApiService } from 'src/app/services/task-api.service';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { ActionSheetController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { NoteApiService } from 'src/app/services/note-api.service';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { ProposalApiService } from 'src/app/services/proposal-api.service';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { ConvertToCustomerPage } from '../modals/convert-to-customer/convert-to-customer.page';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateProposalPage } from '../../proposals/create/create.page';
import { CreatePage as CreateProposalPage } from '../../proposals/create/create.page';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { FiltersPage as TaskFiltersPage } from '../../tasks/modals/filters/filters.page';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { CreateActivityPage } from '../modals/create-activity/create-activity.page';
import { CommonHelper } from 'src/app/classes/common-helper';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  lead_id = this.activatedRoute.snapshot.paramMap.get('id');
  files: File[] = [];

  selectedTab = 'lead';
  lead: any;
  countries = [];
  isLoading = true;
  staff: any;
  isSearching = false;

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    rel_id: this.lead_id,
    rel_type: 'lead',
    status: [],
    assigned: []
  };

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;

  proposals = [];
  proposal_search = '';
  proposal_offset = 0;
  proposal_limit = 20;

  activities = [];
  notes = [];
  private country$: Subscription;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private leadApi: LeadApiService,
    public proposalApi: ProposalApiService,
    public taskApi: TaskApiService,
    private reminderApi: ReminderApiService,
    private noteApi: NoteApiService,
    public taskHelper: TasksHelper,
    private proposalHelper: ProposalsHelper,
    public commonHelper: CommonHelper,
    private countryApi: CountryApiService,
    private staffApi: StaffApiService,
    private downloadApi: DownloadApiService,
    private modalCtrl: ModalController,
    public authService: AuthenticationService,
    private routerOutlet: IonRouterOutlet,
    private actionSheetController: ActionSheetController,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private mpcAlert: MpcAlertService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.lead = this.router.getCurrentNavigation().extras.state;
        this.isLoading = false;
      } else {
        this.getLead();
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

  onSelect(event) {
    console.log(event);
    if(event.rejectedFiles.length > 0){
      this.mpcToast.show(`You can't upload files of this type`, 'danger');
      return;
    }
    if (event.addedFiles.length > 0) {
      let fileSizeUp = [];
      for(let file of event.addedFiles){
        var fileSizeInBytes = file.size;
        var fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
        if (fileSizeInMB > 2) {
          fileSizeUp.push(file.name);
        } 
      }
      if(fileSizeUp.length > 0){
        this.mpcToast.show(`${fileSizeUp.join(', ')} file size must be less than or equal to 2MB.`, 'danger');
        return;
      }
      
  }
    this.files.push(...event.addedFiles);
    this.leadApi.storeAttachments(this.lead_id, event.addedFiles).subscribe({
      next: (response: any) => {
        if (response.status) {
         this.getLead(false);
        }
        this.files = [];
      }
    });

  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  getLead(isLoading = true) {
    this.isLoading = isLoading;
    this.leadApi.get(this.lead_id).subscribe({
      next: (res: any) => {
        this.lead = res;
        this.sharedService.dispatchEvent({
          event: 'admin:get_lead',
          data: this.lead
        });
        this.isLoading = false;
        this.staffApi.get(this.lead.assigned).subscribe(response => {
          this.staff = response;
        });
  
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getProposals(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.proposalApi.get('', this.proposal_search, this.proposal_offset, this.proposal_limit, {
      rel_type: 'lead',
      rel_id: this.lead_id
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.proposals.push(...res);
          this.proposals = [...new Map(this.proposals.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.proposal_limit && refresh == false) {
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

  getTasks(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskApi.get('', this.task_search, this.task_offset, this.task_limit, this.taskAppliedFilters).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.tasks.push(...res);
          this.tasks = [...new Map(this.tasks.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.task_limit && refresh == false) {
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

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.lead_id, 'lead', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.reminders.push(...res);
          this.reminders = [...new Map(this.reminders.map(item => [item?.id, item])).values()];
        }
  
        if (event && res.length !== this.reminder_limit && refresh == false) {
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

  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('lead', this.lead_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.notes = res;
        }
  
        if (event && res.length !== this.task_limit && refresh == false) {
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

  getActivity() {
    this.isLoading = true;
    this.leadApi.getLeadActivity(this.lead_id).subscribe({
      next: res => {
        if (res.status !== false) {
          this.activities = res;
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  getDateDuration(date) {
    return (formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      includeSeconds: false
    })).replace('about ', '');
  }

  getCountryNameById(country_id: Number) {
    for (let country of this.countries) {
      if (country.country_id == country_id) {
        return country.short_name;
      }
    }
    return '';
  }

  async addTask() {
    /* const extras: NavigationExtras = {
      state: {
        rel_type: 'lead',
        rel_name: this.lead.name,
        relational_values: {
          addedfrom: "1",
          id: this.lead.id,
          name: `${this.lead.name} - ${this.lead.email}`,
          subtext: '',
          type: 'lead'
        },
        rel_id: this.lead_id
      }
    };
    this.router.navigate(['admin/tasks/create'], extras); */
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'lead',
          rel_name: this.lead.name,
          relational_values: {
            addedfrom: "1",
            id: this.lead.id,
            name: `${this.lead.name} - ${this.lead.email}`,
            subtext: '',
            type: 'lead'
          },
          rel_id: this.lead_id
        },
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

  async updateTask(taskId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateTaskPage,
      mode: 'ios',
      componentProps: {
        taskId: taskId,
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

  async addEditReminder(reminder: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateReminderPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
      initialBreakpoint: 0.90,
      mode: 'ios',
      componentProps: {
        rel_type: 'lead',
        rel_id: this.lead_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getLead();
        this.getReminders();
      }
    });
    return await modal.present();
  }

  segmentChanged(event: any) {
    this.isSearching = false;
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'proposals' && this.proposals.length == 0) {
      this.getProposals(true);
    }

    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes();
    }

    if (event.detail.value == 'activity_logs' && this.activities.length == 0) {
      this.getActivity();
    }
  }

  ionViewWillEnter() {
    if (this.selectedTab == 'proposals') {
      this.proposals = [];
      this.proposal_offset = 0;
      this.proposal_limit = 20;
      this.getProposals(true);
    }
    if (this.selectedTab == 'tasks') {
      this.tasks = [];
      this.task_offset = 0;
      this.task_limit = 20;
      this.getTasks(true);
    }

  }

  async addEditNote(note: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateNotePage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        rel_id: this.lead_id,
        rel_type: 'lead',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getLead();
        this.getNotes();
      }
    });
    return await modal.present();
  }
  async addActivity() {
    const modal = await this.modalCtrl.create({
      component: CreateActivityPage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        lead_id: this.lead_id
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getActivity()
      }
    });
    return await modal.present();
  }

  async convertToCustomer() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: ConvertToCustomerPage,
      canDismiss: true,
      // presentingElement: this.routerOutlet.nativeEl,
      mode: 'ios',
      componentProps: {
        leadid: this.lead_id,
        lead: this.lead,
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getLead();
      }
    });
    return await modal.present();
  }

  viewProposal(id: any, proposal: any) {
    const extras: NavigationExtras = {
      state: proposal
    };
    this.router.navigate(['admin/proposals/view', id], extras);
  }

  viewTask(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tasks/view', id], extras);
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

  async delete(id: any, index: any, tab = '') {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this[tab + 'Api'].delete(id).subscribe({
        next: res => {
          if (res.status) {
            this[tab + 's'].splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  async deleteAttachment(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.leadApi.deleteAttachment(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.lead.attachments.splice(index, 1); //remove from list
          }
        }
      });
    }
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  async addProposal() {
    const modal = await this.modalCtrl.create({
      component: CreateProposalPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'lead',
          rel_name: this.lead.company,
          relational_values: {
            addedfrom: "1",
            id: this.lead.id,
            name: `${this.lead.name} - ${this.lead.email}`,
            subtext: '',
            type: 'lead'
          },
          rel_id: this.lead.id,
          name: this.lead.name,
          email: this.lead.email
        },
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
  async updateProposal(proposalId: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateProposalPage,
      mode: 'ios',
      componentProps: {
        proposalId: proposalId,
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
  async openPdf() {
    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('view_pdf'),
      handler: () => {
        this.getPDF();
      }
    },
      {
        text: this.translate.instant('download_pdf'),
        handler: () => {
          this.getPDF('download');
        }
      }),

      _buttons.push({
        text: this.translate.instant('cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }

  async openMore() {
    let _buttons = [];
    if (this.lead?.lost === '1' || this.lead?.junk === '1') {
      if (this.lead?.lost === '1') {
        _buttons.push({
          text: this.translate.instant('lead_unmark_as_lost'),
          handler: () => {
            this.markAsLost(0);
          }
        })
      }
      if (this.lead?.junk === '1') {
        _buttons.push({
          text: this.translate.instant('lead_unmark_as_junk'),
          handler: () => {
            this.markAsJunk(0);
          }
        })
      }
    } else {
      _buttons.push({
        text: this.translate.instant('lead_mark_as_lost'),
        handler: () => {
          this.markAsLost(1);
        }
      })
      _buttons.push({
        text: this.translate.instant('lead_mark_as_junk'),
        handler: () => {
          this.markAsJunk(1);
        }
      })
    }

    _buttons.push({
      role: 'destructive',
      text: this.translate.instant('lead_edit_delete_tooltip'),
      handler: () => {
        this.deleteLead();
      }
    })

    _buttons.push({
      text: this.translate.instant('cancel'),
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      // header: 'More',
      buttons: _buttons,
      mode: 'ios'
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
  }
  getPDF(action = 'view') {
    this.leadApi.getPDF(this.lead_id).subscribe({
      next: async (response: any) => {
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'lead_' + this.lead_id + '.pdf',
            data: response.pdf,
            directory: Directory.Documents
          });
  
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/pdf',
            openWithDefault: action == 'view' ? false : true
          });
        }
      }
    });
  }
  deleteLead() {
    this.leadApi.delete(this.lead_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.router.navigate(['/admin/leads/list']);
          window.dispatchEvent(new CustomEvent('admin:lead_deleted'));
        }
      }
    });
  }
  markAsLost(status: Number) {
    this.leadApi.markAsLost(status, this.lead_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getLead();
        } else {
          this.mpcToast.show(response.message, 'danger')
        }
      }, error: (err: any) => {
        this.mpcToast.show(err.message, 'danger')
      }
    });
  }
  markAsJunk(status: Number) {
    this.leadApi.markAsJunk(status, this.lead_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getLead();
        } else {
          this.mpcToast.show(response.message ?? response.error, 'danger')
        }
      }
    });
  }
  async openFilters() {
    const modal = await this.modalCtrl.create({
      component: TaskFiltersPage,
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters: any) => {
      if (modalFilters.data) {
        this.isFiltered = false;
        this.taskAppliedFilters = modalFilters.data;

        if (this.taskAppliedFilters.status.length !== 0 || this.taskAppliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        this.task_offset = 0;
        this.tasks = [];
        this.getTasks(true);
      }
    });
    return await modal.present();

  }
  notesRefresh(event) {
    if (event) {
      this.getNotes();
    }
  }
  reminderRefresh(event) {
    if (event) {
      this.getReminders();
    }
  }

  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('lead_attachment', attachment_id).subscribe({
      next: async (response: any) => {
        const blobData = await this.blobToBase64(response);
  
        try {
          // Write the base64-encoded string to a file in the Documents directory
          const savedFile = await Filesystem.writeFile({
            path: filename,
            data: blobData,
            directory: Directory.Documents,
          });
  
          // Open the files using the FileOpener plugin
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: filetype,
            openWithDefault: true
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read Blob as base64.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }
}
