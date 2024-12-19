import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, IonItemSliding, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { TasksHelper, STATUS_COMPLETE } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { CreateCommentPage } from '../modals/create-comment/create-comment.page';
import { CreateTimesheetPage } from '../modals/create-timesheet/create-timesheet.page';
import { CopyTaskPage } from '../modals/copy-task/copy-task.page';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateTaskPage} from 'src/app/pages/admin/tasks/create/create.page';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { Browser } from '@capacitor/browser';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { IonicSelectableComponent } from 'ionic-selectable';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';
@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  @Input() taskId: any;
  @Input() type = '';
  @Input() taskInfo:any;
  task_id = this.activatedRoute.snapshot.paramMap.get('id');

  STATUS_COMPLETE = STATUS_COMPLETE;

  selectedTab = 'task_info';
  task: any;
  isLoading = true;
  task_status: any;
  task_priority: any;

  comments = [];

  reminders = [];
  reminder_search = '';
  reminder_offset = 0;
  reminder_limit = 20;

  staffs = [];
  followers = [];
  assignees = [];
  checklistTemplates = [];
  submitting = false;

  timerStart = false;
  file: File;
  files = [];
  isAddButton = true;

  settings: any;
  isSearching = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public taskApi: TaskApiService,
    private staffApi: StaffApiService,
    private downloadApi: DownloadApiService,
    public taskHelper: TasksHelper,
    private reminderApi: ReminderApiService,
    public authService: AuthenticationService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private mpcToast: MpcToastService,
    private sharedService: SharedService,
    private settingHelper: SettingsHelper,
    private mpcAlert: MpcAlertService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {
  }

  ngOnInit() {
    this.task_id = this.task_id ?? this.taskId;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.task = this.router.getCurrentNavigation().extras.state;
        console.log('this.task =>', this.task);
        this.timerStart = this.task.is_timer_started;
        this.task_status = this.taskHelper.get_task_status_by_id(this.task.status);
        this.task_priority = this.taskHelper.task_priority(this.task.priority);
        this.checklistTemplates = this.task.checklistTemplates;
        this.isLoading = false;
        this.getStaffs();
      } else {
        if(this.type === 'modal' && this.taskInfo){
          this.task = this.taskInfo;
          this.timerStart = this.task.is_timer_started;
          this.task_status = this.taskHelper.get_task_status_by_id(this.task.status);
          this.task_priority = this.taskHelper.task_priority(this.task.priority);
          this.checklistTemplates = this.task.checklistTemplates;
          this.isLoading = false;
          this.getStaffs(false);
        }else{
          this.getTask();
        }
      }
    });

    this.settingHelper.settings.subscribe((response) => {
      console.log(response);
      this.settings = response;
    });
  }

  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('taskattachment', attachment_id).subscribe({
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

  taskProgressBar() {
    const checklist = this.task?.checklist_items ? this.task?.checklist_items : [];
    const completed_checklist = checklist.length ? checklist.filter(res => res.finished == 1) : [];
    const result = (completed_checklist.length && checklist.length) ? Math.round(((100 * completed_checklist.length) / checklist.length)) : 0;
    return result;
  }

  getTask(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskApi.get(this.task_id).subscribe({
      next: (res) => {
        this.task = res;
        this.isLoading = false;
        this.timerStart = this.task.is_timer_started;
        this.task_status = this.taskHelper.get_task_status_by_id(this.task.status);
        this.task_priority = this.taskHelper.task_priority(this.task.priority);
        this.checklistTemplates = this.task.checklistTemplates;

        this.getStaffs(isLoading);
  
        this.sharedService.dispatchEvent({
          event: 'admin:get_task',
          data: this.task
        });
  
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

  getStaffs(isLoading = true) {
    this.isLoading = isLoading;
    this.staffApi.get().subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.staffs = response;
          this.followers = response.filter(staff => {
            return !this.task.followers_ids.includes(staff.staffid);
          });
          const projectMemberIds = (this.task.project_members && this.task.project_members.length > 0) ? this.task.project_members.map(res => res.staff_id) : [];
          this.task.assignees_ids = [...this.task.assignees_ids, ...projectMemberIds];
          this.assignees = response.filter(staff => {
            return !this.task.assignees_ids.includes(staff.staffid)
          });
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  getComments(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskApi.getComments(this.task_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.comments = res;
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

  getReminders(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.reminderApi.get(this.task_id, 'task', this.reminder_search, this.reminder_offset, this.reminder_limit).subscribe({
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

  searchReminders(event) {
    this.reminder_search = event.detail.value;
    this.reminder_offset = 0;
    this.reminders = [];
    this.getReminders(true, false, true);
  }

  loadMoreReminders(event) {
    this.reminder_offset += this.reminder_limit;
    this.getReminders(false, event, false);
  }

  async addEditTimeSheet(timesheet: any = null) {
    const modal = await this.modalCtrl.create({
      component: CreateTimesheetPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 1.0],
      initialBreakpoint: 0.75,
      mode: 'ios',
      componentProps: {
        task: this.task,
        timesheet: timesheet
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.getTask();
      }
    });
    return await modal.present();
  }

  async addEditComment(comment: any = null) {
    const modal = await this.modalCtrl.create({
      component: CreateCommentPage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        task: this.task,
        comment: comment
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTask(false,false,false);
        this.getComments(false,false,true);
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
        rel_type: 'task',
        rel_id: this.task_id,
        reminder: reminder
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTask(false,false,false);
        this.getReminders(false,false,true);
      }
    });
    return await modal.present();
  }

  openSlide(itemSlide: IonItemSliding) {
    itemSlide.open('start');
  }

  addAssignee(event: any) {
    this.isAddButton = false;
    this.taskApi.addAssignee({ assignee: event.value, taskid: this.task_id }).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask();
        }
        this.isAddButton = true;
      }, error: () => {
        this.isAddButton = true;
      }
    });
  }

  addFollower(event: any) {
    this.isAddButton = false;
    this.taskApi.addFollower({ follower: event.value, taskid: this.task_id }).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask();
        }
        this.isAddButton = true;
      }, error: () => {
        this.isAddButton = true;
      }
    });
  }

  addChecklist(description: String = '') {
    this.taskApi.addChecklist({ description: description, taskid: this.task_id }).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask(false);
        }
      }
    });
  }

  updateChecklist(id, desc: any) {
    this.taskApi.updateChecklist({
      listid: id,
      description: desc,
      taskid: this.task_id
    }).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask(false);
        }
      }
    });
  }

  updateItemCheckbox(id, event) {
    this.taskApi.updateItemCheckbox(id, (event.detail.checked === true ? 1 : 0)).subscribe({
      next: () => {
        this.getTask(false);
      }
    });
  }

  addAssignStaff(event:{
    component: IonicSelectableComponent,
    value: any
  }, id: any) {
    console.log('id =>', id);
    console.log('event =>', event);
    if(!event.value){
      return;
    }
    this.taskApi.assignChecklist({ taskId:this.task_id, checklistId: id, assigned: event.value}).subscribe({
      next: () => {
        this.getTask(false);
      }
    });
  }

  addTemplateChecklist(description: String, index: any) {
    this.taskApi.addChecklistItemTemplate({ description: description }).subscribe({
      next: () => {
        this.getTask(false);
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    // if (event.detail.value == 'timesheets' && this.timesheets.length == 0) {
    //   this.getTimesheets();
    // }

    if (event.detail.value == 'comments' && this.comments.length == 0) {
      this.getComments();
    }

    if (event.detail.value == 'reminders' && this.reminders.length == 0) {
      this.getReminders(true);
    }
  }

 async deleteAssignee(id: any, index: any) {
  const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteAssignee(id, this.task_id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.getTask();
          }
        }
      });
    }  
  }

  async deleteFollower(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteFollower(id, this.task_id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.getTask();
          }
        }
      });
    }
  }

  async deleteChecklist(id: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteChecklist(id, this.task_id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.getTask(false);
            itemSlide.close();
          }
        }
      });
    }
  }

  deleteReminder(id: any, index: any) {
    this.reminderApi.delete(id).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.reminders.splice(index, 1); //remove from list
        }
      }
    });
  }

  async deleteTimeSheet(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteTimeSheet(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.task.timesheets.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }
      });
    }
  }

  async deleteComment(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteComment(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.comments.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }
      });
    }
  }

  edit(id: any) {
    this.router.navigateByUrl('admin/tasks/edit/' + id);
  }

  trackByFn(index: number, item: any): number {
    return item.serialNumber;
  }

  doRefresh(event: any, tab = '') {
    this['get' + this.capitalizeFirstLetter(tab) + 's'](true, event);
  }

  doTaskRefresh(event: any, tab = '') {
    this.getTask(true, event);
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  close() {
    this.modalCtrl.dismiss(true, 'data');
  }

  async openUpdateStatus() {
    const statusList = this.taskHelper.get_statuses();
    let _buttons = [];
    for (let status of statusList) {
      if (this.task.status != status.id) {
        _buttons.push({
          text: `${this.translate.instant('mark_as')} ${this.translate.instant(status.name)}`,
          handler: () => {
            this.markAsStatus(status.id)
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

  async openUpdatePriority() {
    const priorities = this.taskHelper.get_tasks_priorities();

    let _buttons = [];

    for (let priority of priorities) {
      if (this.task.priority != priority.id) {
        _buttons.push({
          text: this.translate.instant(priority.name),
          handler: () => {
            this.markAsPriority(priority.id);
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

  async openMore() {

    let _buttons = [];

    _buttons.push({
      text: this.translate.instant('copy_task'),
      handler: () => {
        console.log('Cancel clicked');
        this.openCopyModal();
      }
    });
    _buttons.push({
      text: this.translate.instant('delete_task'),
      handler: () => {
        console.log('Delete clicked');
        this.deleteTask();
      }
    });

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

  markAsStatus(status: Number) {
    this.taskApi.markAsStatus(status, this.task_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask();
        }
      }
    });
  }

  markAsPriority(priority: Number) {
    this.taskApi.markAsPriority(priority, this.task_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask();
        }
      }
    });
  }

  deleteTask() {
    this.taskApi.delete(this.task_id).subscribe({
      next: (res: any) => {
        if (res.status) {
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/tasks/list']);
          } else {
            this.close();
          }
        }
      }, error: () => {}
    });
  }
  
  async openCopyModal() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CopyTaskPage,
      breakpoints: [0, 0.25, 0.5, 0.75, 0.90, 1.0],
      initialBreakpoint: 0.90,
      mode: 'ios',
      componentProps: {
        task_id: this.task_id
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        // this.getTask();
        // this.getReminders();
      }
    });
    return await modal.present();
  }

  timerTask(timer_id = '', note = '') {
    const data = { task_id: this.task_id, timer_id, note };

    this.submitting = true;
    this.taskApi.timerTask(data).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.getTask();
        }
  
        this.submitting = false;
        this.timerStart = !this.timerStart;
      }, error: () => {
        this.submitting = false;
        this.timerStart = true;
      }
    });
  }

  async showNoteAlert() {
    const alert = await this.alertController.create({
      header: 'Note',
      mode: 'ios',
      backdropDismiss: false,
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: 'please some write',
          attributes: {
            required: true,
            minLength: 1
          }
        },
      ],
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: (value: any) => {
            console.log('save ', value)
            return false;
          }
        },
        {
          text: this.translate.instant('save'),
          handler: (data: any) => {
            if (data.note) {
              console.log('User input:', data.note);
              this.timerTask(this.task?.is_timer_started?.id ?? null, data.note);
            } else {
              console.log('Input is required!');
              return false;
            }
          }
        }

      ],
    });

    await alert.present();
  }

  addAttachments(task_id) {
    this.taskApi.uploadFile(task_id, this.file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getTask();
          this.file = null;
          this.mpcToast.show(response.message);
        } else {
          this.file = null;
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  async deleteFile(file_id) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.taskApi.deleteFile(file_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.getTask();
            this.mpcToast.show(response.message);
          } else {
            this.mpcToast.show(response.message, 'danger');
          }
        }
      });
    }
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
    this.addAttachments(this.task_id);
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }

  reminderRefresh(event){
    if(event){
      this.getReminders();
    }
  }

  goToPage(page){
    if(this.type == 'modal'){
      this.close();
    }
    this.router.navigate([`${page}`]);
  }

  async editTask(id:any){
    if(this.type === 'modal'){
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateTaskPage,
        showBackdrop: false,
        mode: 'ios',
        componentProps: {
          taskId: id,
          type: 'modal'
        },
        enterAnimation: this.animationService.enterAnimation,
        leaveAnimation: this.animationService.leaveAnimation,
      });
      modal.onDidDismiss().then((modalFilters) => {
        console.log(modalFilters);
      });
      return await modal.present();
    }else{
      this.router.navigate(['admin/tasks/edit/', id]);
    }
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
  searchStaff(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.staffApi.get('', searchText, 0, 20).subscribe({
      next: (res: any) => {
        event.component.endSearch();
        if(res.status != false){
          event.component.items = res;
        }else{
          event.component.items = []
        }
      }, error: () => {
        event.component.endSearch();
      }
    });
  }
}
