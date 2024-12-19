import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FileOpener } from '@capacitor-community/file-opener';
import { Browser } from '@capacitor/browser';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, IonItemSliding, IonRouterOutlet, ModalController, NavController, ToastController } from '@ionic/angular';
import { ContractHelper,STATUS_NOT_SIGNED, STATUS_SIGNED, STATUS_MARK_AS_SIGNED } from 'src/app/classes/contract-helper';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { NoteApiService } from 'src/app/services/note-api.service';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';
import { CreatePage as EstimateCreatePage } from '../../estimates/create/create.page';
import { CreatePage as InvoiceCreatePage } from '../../invoices/create/create.page';
import { CreateNotePage } from '../../invoices/modals/create-note/create-note.page';
import { CreateReminderPage } from '../../invoices/modals/create-reminder/create-reminder.page';
import { FiltersPage } from '../../tasks/modals/filters/filters.page';
import { CreatePage as CreateTaskPage } from '../../tasks/create/create.page';
import { CreatePage as UpdateTaskPage } from '../../tasks/create/create.page';
import { SharedService } from 'src/app/services/shared.service';
import { CreatePage as UpdateContractPage } from 'src/app/pages/admin/contracts/create/create.page';
import { AttachFileApiService } from 'src/app/services/attach-file-api.service';
import { DownloadApiService } from 'src/app/services/download-api.service';
import { MpcAlertService } from 'src/app/services/mpc-alert.service';
import { CreateCommentPage } from '../modals/create-comment/create-comment.page';
import { CreateTemplatePage } from '../../proposals/modals/create-template/create-template.page';
import { CommonHelper } from 'src/app/classes/common-helper';
import { TemplateApiService } from 'src/app/services/template-api.service';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {

  contract_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() contractId: any;
  @Input() type = '';
  @Input() contractInfo: any;
  selectedTab = 'contract';
  contract: any;
  isSearching = false;

  STATUS_NOT_SIGNED = STATUS_NOT_SIGNED;
  STATUS_SIGNED = STATUS_SIGNED;
  STATUS_MARK_AS_SIGNED = STATUS_MARK_AS_SIGNED;

  comments = [];
  templates = [];
  notes = [];

  tasks = [];
  task_search = '';
  task_offset = 0;
  task_limit = 20;
  isFiltered = false;
  taskAppliedFilters = {
    contract_id: this.contract_id,
    rel_type: 'contracts',
    rel_id: this.contract_id,
    status: '',
    assigned: ''
  };
  isLoading = true;
  files = [];
  file: File;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private contractApi: ContractApiService,
    private noteApi: NoteApiService,
    public taskApi: TaskApiService,
    public modalCtrl: ModalController,
    public contractHelper: ContractHelper,
    public authService: AuthenticationService,
    public taskHelper: TasksHelper,
    private mpcToast: MpcToastService,
    private actionSheetController: ActionSheetController,
    private sharedService: SharedService,
    private attachFileApi: AttachFileApiService,
    private downloadApi: DownloadApiService,
    private mpcAlert: MpcAlertService,
    public commonHelper: CommonHelper,
    private templateApi: TemplateApiService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {

  }
  ngOnInit() {
    this.contract_id = this.contract_id ?? this.contractId;
    this.taskAppliedFilters.rel_id = this.contract_id;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        this.contract = this.router.getCurrentNavigation().extras.state;
        console.log('this.contract extra =>', this.contract);
        // this.calculatecontract();
        this.isLoading = false;
      } else {
        if (this.type === 'modal' && this.contractInfo) {
          this.contract = this.contractInfo;
          this.isLoading = false;
        } else {
          this.getContract();
        }
      }
    });
  }
  ngOnDestroy(): void {
  }

  getContract(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.contractApi.get(this.contract_id).subscribe({
      next: (response: any) => {
        console.log('contract response =>', response);
        this.contract = response;
        this.sharedService.dispatchEvent({
          event: 'admin:get_contract',
          data: this.contract
        });
        if (event && refresh == false) {
          event.target.disabled = true;
        }
  
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }, error: (err: any) => {
        console.log('contract error =>', err);
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  getComments(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.contractApi.getComments(this.contract_id).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.comments = response;
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
  getTemplates(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.templateApi.get('','', 0, 20, {
      rel_type: 'contracts',
      rel_id: this.contract_id
    }).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.templates = response;
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
  getNotes(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.noteApi.get('contracts', this.contract_id).subscribe({
      next: (response: any) => {
        if (response.status !== false) {
          this.notes = response;
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
  getTasks(refresh = false, event: any = false, isLoading = true) {
    this.isLoading = isLoading;
    this.taskAppliedFilters.contract_id = this.contract_id;
    this.taskApi.get('', this.task_search, this.task_offset, this.task_limit, this.taskAppliedFilters).subscribe({
      next:(response: any) => {
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

  getStatusNameByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).name;
  }
  getStatusColorByStatusId(status) {
    return this.taskHelper.get_task_status_by_id(status).color;
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

  doContractRefresh(event: any, tab = '') {
    this.getContract(true, event);
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
      next: (response: any) => {
        if (response.status) {
          this[tab + 's'].splice(index, 1); //remove from list
        }
      }, error: () => {

      }
    });
  }

  viewTask(id: any, task: any) {
    const extras: NavigationExtras = {
      state: task
    };
    this.router.navigate(['admin/tasks/view', id], extras);
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;

    if (event.detail.value == 'tasks' && this.tasks.length == 0) {
      this.getTasks(true);
    }

    if (event.detail.value == 'comments' && this.comments.length == 0) {
      this.getComments();
    }
    if (event.detail.value == 'templates' && this.templates.length == 0) {
      this.getTemplates();
    }

    if (event.detail.value == 'notes' && this.notes.length == 0) {
      this.getNotes();
    }
    if (event.detail.value == 'files' && this.files.length == 0) {
      this.getFiles();
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
        rel_id: this.contract.id,
        rel_type: 'contracts',
        note: note
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getContract();
        this.getNotes();
      }
    });
    return await modal.present();
  }

  async addEditComment(comment: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateCommentPage,
      breakpoints: [0, 0.25, 0.5, 0.75],
      initialBreakpoint: 0.5,
      mode: 'ios',
      componentProps: {
        contract: this.contract,
        comment: comment
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getContract();
        this.getComments();
      }
    });
    return await modal.present();
  }
  async addEditTemplate(template: any = null) {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: CreateTemplatePage,
      breakpoints: [0, 0.25, 0.5, 0.75,1.0],
      initialBreakpoint: 0.75,
      mode: 'ios',
      componentProps: {
        rel_type: 'contracts',
        rel_id: this.contract_id,
        template: template
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        console.log('Modal Sent Data : ', modalFilters.data);
        this.getTemplates();
      }
    });
    return await modal.present();
  }

  async addTask() {
    const modal = await this.modalCtrl.create({
      component: CreateTaskPage,
      mode: 'ios',
      componentProps: {
        extraInfo: {
          rel_type: 'contracts',
          rel_name: this.contract_id,
          relational_values: {
            addedfrom: "1",
            id: this.contract.id,
            name: this.contract.contract_number,
            subtext: '',
            type: 'contract'
          },
          rel_id: this.contract_id
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
  async deleteComment(id: any, index: any, itemSlide: IonItemSliding) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.contractApi.deleteComment(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.comments.splice(index, 1); //remove from list
            itemSlide.close();
          }
        }, error: () => {
          itemSlide.close();
        }
      });
    }
  }
  async deleteTemplate(id: any, index: any) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.contractApi.deleteTemplate(id).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.templates.splice(index, 1); //remove from list
          }
        }, error: () => {}
      });
    }
  }

  viewContract() {
    Browser.open({
      url: this.authService.BASE_URL + '/contract/' + this.contract_id + '/' + this.contract.hash
    });
  }

  getPDF(action = 'view') {
    this.contractApi.getPDF(this.contract_id).subscribe({
      next: async (response: any) => {
        console.log(response);
        if (response.status) {
          const savedFile = await Filesystem.writeFile({
            path: 'contract_' + this.contract_id + '.pdf',
            data: response.pdf,
            directory: Directory.Documents
          });
         
          await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/pdf',
            openWithDefault: action == 'view' ? false : true
          });
        }
      }, error: () => {}
    });
  }

  markSigned() {
    this.contractApi.markAsSigned(this.contract_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getContract();
        }
      }, error: () => {}
    });
  }
  UnMarkSigned() {
    this.contractApi.unMarkAsSigned(this.contract_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getContract();
        }
      }, error: () => {}
    });
  }
  clearSignature() {
    this.contractApi.clearSignature(this.contract_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getContract();
        }
      }, error: () => {}
    });
  }

  copyContract() {
    this.contractApi.copy(this.contract_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          this.router.navigate(['/admin/contracts/edit/' + response.insert_id]);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }, error: () => {}
    });
  }

  deleteContract() {
      this.contractApi.delete(this.contract_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.router.navigate(['/admin/contracts/list']);
          }
        }, error: () => {}
      });
  }

  capitalizeFirstLetter(string) {
    if (string.indexOf('_') > -1) {
      let __string = string.split('_');
      string = __string[0] + __string[1].charAt(0).toUpperCase() + __string[1].slice(1)
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
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

    _buttons.push({
      text: this.translate.instant('view_contract'),
      handler: () => {
        this.viewContract();
      }
    });
    if (this.authService.hasPermission('contracts', ['edit']) && this.contract.marked_as_signed != '1' && this.contract.signed != '1') {
      _buttons.push({
        text: this.translate.instant('mark_as_signed'),
        handler: () => {
          this.markSigned();
        }
      });
    }
    if (this.authService.hasPermission('contracts', ['edit']) && this.contract.marked_as_signed == '1' && this.contract.signed != '1') {
      _buttons.push({
        text: this.translate.instant('unmark_as_signed'),
        handler: () => {
          this.UnMarkSigned();
        }
      });
    }
    if (this.authService.hasPermission('contracts', ['edit']) && this.contract.marked_as_signed != '1' && this.contract.signed == '1') {
      _buttons.push({
        text: this.translate.instant('clear_signature'),
        handler: () => {
          this.clearSignature();
        }
      });
    }

    if (this.authService.hasPermission('contracts', ['create'])) {
      _buttons.push({
        text: this.translate.instant('copy'),
        handler: () => {
          this.copyContract();
        }
      });
    }

    _buttons.push({
      text: this.translate.instant('_delete'),
      cssClass: 'contract-action-sheet-delete-button',
      handler: async () => {
        const confirmItem = await this.mpcAlert.deleteAlertMessage();
        if(confirmItem){
          this.deleteContract();
        }
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

  async openFilters() {
    console.log('open Filters');
    const modal = await this.modalCtrl.create({
      component: FiltersPage,
      canDismiss: true,
      mode: 'ios',
      componentProps: {
        appliedFilters: this.taskAppliedFilters
      }
    });

    modal.onDidDismiss().then((modalFilters) => {
      console.log(modalFilters);
      if (modalFilters.data) {
        this.isFiltered = false;
        this.taskAppliedFilters = modalFilters.data;

        if (this.taskAppliedFilters.status.length !== 0 || this.taskAppliedFilters.assigned.length !== 0) {
          this.isFiltered = true;
        }

        console.log('Modal Sent Data : ', modalFilters.data);

        this.task_offset = 0;
        this.tasks = [];
        this.getTasks(true);
      }
    });
    return await modal.present();
  }

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  notesRefresh(event) {
    if (event) {
      this.getNotes();
    }
  }

  goToPage(page) {
    this.router.navigate([`${page}`]);
  }

  async editContract(id: any) {
    if (this.type === 'modal') {
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: UpdateContractPage,
        mode: 'ios',
        componentProps: {
          contractId: id,
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
      this.router.navigate(['admin/contracts/edit/', id]);
    }
  }
  getFiles(refresh = false, event: any = false, isLoading = true) {
    this.contractApi.getFiles(this.contract_id).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.files = res;
        }
  
        if (event && res.length !== this.task_limit && refresh == false) {
          event.target.disabled = true;
        }
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
  
      }, error: () =>{
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  addAttachments(project_id) {
    this.contractApi.uploadFile(project_id, this.file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.getFiles();
          this.file = null;
          this.mpcToast.show(response.message);
        } else {
          this.file = null;
          this.mpcToast.show(response.message, 'danger');
        }
      }, error: () => {

      }
    });
  }

  async deleteFile(file_id, index) {
    const confirmItem = await this.mpcAlert.deleteAlertMessage();
    if(confirmItem){
      this.contractApi.deleteFile(file_id).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.files.splice(index, 1);
            this.getFiles();
            this.mpcToast.show(response.message);
          } else {
            this.mpcToast.show(response.message, 'danger');
          }
        }, error: () => {}
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
    this.addAttachments(this.contract_id);
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }
 
  downloadAttachment(attachment_id: any, filetype: any, filename: any) {
    this.downloadApi.get('contract_attachment', attachment_id).subscribe({
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
      }, error: () => {}
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
