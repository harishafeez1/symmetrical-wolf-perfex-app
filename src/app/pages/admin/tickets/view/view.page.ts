import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Browser } from '@capacitor/browser';
import { TicketApiService } from 'src/app/services/ticket-api.service';
import { TicketReplyPage } from '../modals/ticket-reply/ticket-reply.page';
import { NoteApiService } from 'src/app/services/note-api.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { TaskApiService } from 'src/app/services/task-api.service';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { FiltersPage as TaskFiltersPage } from '../../tasks/modals/filters/filters.page';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateTicketPage } from 'src/app/pages/admin/tickets/create/create.page';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit, OnDestroy {
  @Input() ticketId: any;
  @Input() type = '';
  @Input() ticketInfo: any;
  ticket_id = this.activatedRoute.snapshot.paramMap.get('id');
  isStatusOpen = false;
  selectedTab = 'replies';
  ticket: any;
  countries = [];
  currencies = [];
  isLoading = true;
  isSearching = false;

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    rel_type: 'ticket',
    rel_id: this.ticket_id,
    status: [],
    assigned: []
  };

  notes = [];

  plans = [];
  stripe_tax_rates = [];
  file: File;
  files = [];
  isStatusLoading = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ticketApi: TicketApiService,
    private noteApi: NoteApiService,
    private reminderApi: ReminderApiService,
    public taskApi: TaskApiService,
    public taskHelper: TasksHelper,
    public authService: AuthenticationService,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private downloadApi: DownloadApiService,
    private actionSheetController: ActionSheetController,
    private translate: TranslateService,
    private animationService: AnimationService,
    // private routerOutlet: IonRouterOutlet
  ) {

  }

  ngOnInit() {
    this.ticket_id = this.ticket_id ?? this.ticketId;
    this.taskAppliedFilters.rel_id = this.ticket_id;
    window.addEventListener("admin:ticket_updated", () => {
      this.getTicket();
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.ticket = this.router.getCurrentNavigation().extras.state;
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.ticketInfo) {
          this.ticket = this.ticketInfo;
          this.isLoading = false;
        } else {
          this.getTicket();
        }
      }
    });

  }

  ngOnDestroy(): void {
  }

  async viewSubscription() {
    await Browser.open({ url: this.authService.BASE_URL + '/ticket/' + this.ticket?.hash });
  }

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }

  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
  }

  getTicket(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.ticketApi.get(this.ticket_id).subscribe({
      next: (response) => {
        this.ticket = response;
        this.sharedService.dispatchEvent({
          event: 'admin:get_ticket',
          data: this.ticket
        });
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
    this.reminderApi.get(this.ticket_id, 'ticket', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
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

  getNotes(isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('ticket', this.ticket_id).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status !== false) {
          this.notes = response;
        }
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getTasks(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskApi.get('', this.task_search, this.task_offset, this.task_limit, this.taskAppliedFilters).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.tasks.push(...response);
          this.tasks = [...new Map(this.tasks.map(item => [item?.id, item])).values()];
        }
  
        if (event && response.length !== this.task_limit && refresh == false) {
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

  async addReply() {
    const modal = await this.modalCtrl.create({
      component: TicketReplyPage,
      canDismiss: true,
      mode: 'ios',
      componentProps: {
        ticket: this.ticket
      }
    });

    modal.onDidDismiss().then((response) => {
      console.log(response);
      if (response.data) {
        console.log('Modal Sent Data : ', response.data);
        this.getTicket();
      }
    });
    return await modal.present();
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

  doRefreshReminders(event: any, tab = '') {
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  doRefresh(event: any) {
    this.getTicket(true, event);
  }

  doSearch(event: any, tab = '') {
    console.log('event', event.detail.value);
    this[tab + '_search'] = event.detail.value;
    this[tab + '_offset'] = 0;
    this[tab + 's'] = [];
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, false, false);
  }

  loadMore(event: any, tab = '') {
    this[tab + '_offset'] += this[tab + '_limit'];
    console.log(tab + '_offset:', this[tab + '_offset']);
    this['get' + this.capitalizeFirstLetter(tab) + 's'](false, event, false);
  }

  delete(id: any, index: any, tab = '') {
    this[tab + 'Api'].delete(id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this[tab + 's'].splice(index, 1); //remove from list
        }
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes(true);
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
        rel_id: this.ticket_id,
        rel_type: 'ticket',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTicket();
        this.getNotes(true);
      }
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
        rel_type: 'ticket',
        rel_id: this.ticket_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTicket();
        this.getReminders();
      }
    });
    return await modal.present();
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  async addTask() {
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'ticket',
          rel_name: this.ticket.subject,
          relational_values: {
            addedfrom: "1",
            id: this.ticket.ticketid,
            name: `${this.ticket.ticketid}-${this.ticket.subject}`,
            subtext: '',
            type: 'ticket'
          },
          rel_id: this.ticket.ticketid
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
        console.log('this.taskAppliedFilters 12 =>', this.taskAppliedFilters);

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

  addAttachments(ticket_id) {
    this.ticketApi.uploadFile(ticket_id, this.file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getFiles();
          this.file = null;
          this.mpcToast.show(response.message);
        } else {
          this.file = null;
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  deleteFile(file_id) {
    this.ticketApi.deleteFile(file_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getFiles();
          this.mpcToast.show(response.message);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  onSelect(event) {
    if(event.rejectedFiles.length > 0){
      this.mpcToast.show(`You can't upload files of this type`, 'danger');
      return;
    }
    if (event.addedFiles.length > 0) {
      var fileSizeInBytes = event.addedFiles[0].size;
      var fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB

      if (fileSizeInMB > 2) {
        this.mpcToast.show('File size must be less than or equal to 2MB.', 'danger');
        return;
      } 
  }

    this.file = event.addedFiles[0];
    this.addAttachments(this.ticket_id);
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }

  getFiles(refresh = false, event: any = false, isLoading = true) {
    this.ticketApi.getFiles(this.ticket_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.files = res;
        }
        if (event && refresh == false) {
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

  async editTicket(id: any) {
    if (this.type === 'modal') {
      if (this.modalCtrl.getTop()) {
        this.modalCtrl.dismiss();
      }
      const modal = await this.modalCtrl.create({
        component: UpdateTicketPage,
        mode: 'ios',
        componentProps: {
          ticketId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });

      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    } else {
      this.router.navigate(['admin/tickets/edit/', id]);
    }
  }

  openTicketStatus() {
    this.isStatusLoading = true;
    let _buttons = [];
    this.ticketApi.getStatuses().subscribe({
      next: async (response: any) => {
        this.isStatusLoading = false;
        console.log('res status =>', response);
        if (!response.status) {
          const statusList = response;
  
          for (let status of statusList) {
            if (this.ticket.status != status.ticketstatusid) {
              _buttons.push({
                text: `${status.name}`,
                handler: () => {
                  this.markAsStatus(status.ticketstatusid)
                }
              });
            }
          }
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
  
      }, error: () => this.isStatusLoading = false
    });
  }

  markAsStatus(status: Number) {
    this.ticketApi.markAsStatus(status, this.ticket_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTicket();
        }
      }
    });
  }

  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('ticket', attachment_id).subscribe({
      next: async (response: any) => {
        const blobData = await this.blobToBase64(response);
  
        try {
          // Write the base64-encoded string to a file in the Documents directory
          const savedFile = await Filesystem.writeFile({
            path: filename,
            data: blobData,
            directory: Directory.Documents,
          });
  
          // Open the PDF using the FileOpener plugin
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
}
