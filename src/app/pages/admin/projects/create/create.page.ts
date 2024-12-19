import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage as ViewProjectPage} from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { EditorOption } from 'src/app/constants/editor';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit {
  project_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() extraInfo: any
  @Input() type = '';
  @Input() projectId:any;
  formGroup: FormGroup;
  selectedTab = 'project_details';

  project: any;
  isLoading = true;
  submitting = false;
  customers = [];
  statuses = [];
  staffs = [];
  progress = 0;

  editorOption = EditorOption;

  projectTabs = [];
  settings: any;
  estimate:any;
  estimateItems = [];
  authUser:any;
  isDeadlineModalOpen = false;
  isDateModalOpen = false;
  constructor(
    private nav: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private customerApi: CustomerApiService,
    private projectApi: ProjectApiService,
    private projectHelper: ProjectsHelper,
    private settingHelper: SettingsHelper,
    private staffApi: StaffApiService,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    public authService: AuthenticationService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {
  }

  getProject() {

    if (this.project_id) {
      this.isLoading = true;
      this.projectApi.get(this.project_id).subscribe({
        next: (res: any) => {
          this.project = res;
          const available_features = [];
          for (let tab in this.project.settings.available_features) {
            if (this.project.settings.available_features[tab] == 1) {
              available_features.push(tab);
            }
          }
  
          this.formGroup.patchValue({
            name: this.project.name,
            progress_from_tasks: this.project.progress_from_tasks,
            progress: this.project.progress,
            billing_type: this.project.billing_type,
            status: parseInt(this.project.status),
            project_cost: this.project.project_cost,
            project_rate_per_hour: this.project.project_rate_per_hour,
            estimated_hours: this.project.estimated_hours,
  
            start_date: this.project.start_date ? this.dateTimePipe.transform(this.project.start_date) : '',
            deadline: this.project.deadline ? this.dateTimePipe.transform(this.project.deadline) : '',
            description: this.project.description,
            send_created_email: this.project.send_created_email,
            contact_notification: this.project.contact_notification,
            settings: {
              available_features: available_features,
              view_tasks: parseInt(this.project.settings.view_tasks),
              create_tasks: parseInt(this.project.settings.create_tasks),
              edit_tasks: parseInt(this.project.settings.edit_tasks),
              comment_on_tasks: parseInt(this.project.settings.comment_on_tasks),
              view_task_comments: parseInt(this.project.settings.view_task_comments),
              view_task_attachments: parseInt(this.project.settings.view_task_attachments),
              view_task_checklist_items: parseInt(this.project.settings.view_task_checklist_items),
              upload_on_tasks: parseInt(this.project.settings.upload_files),
              view_task_total_logged_time: parseInt(this.project.settings.view_task_total_logged_time),
              view_finance_overview: parseInt(this.project.settings.view_finance_overview),
              upload_files: parseInt(this.project.settings.upload_files),
              open_discussions: parseInt(this.project.settings.open_discussions),
              view_milestones: parseInt(this.project.settings.view_milestones),
              view_gantt: parseInt(this.project.settings.view_gantt),
              view_timesheets: parseInt(this.project.settings.view_timesheets),
              view_activity_log: parseInt(this.project.settings.view_activity_log),
              view_team_members: parseInt(this.project.settings.view_team_members),
              hide_tasks_on_main_tasks_table: parseInt(this.project.settings.hide_tasks_on_main_tasks_table)
            }
          });
  
          this.loadApiData();
          this.isLoading = false;
        }, error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadApiData();
    }
  }

  loadApiData() {

    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
        if (this.project) {
          const project_memebrs = [];
          for (const staff of this.project.project_members) {
            project_memebrs.push(staff.staffid);
          }
  
          this.formGroup.controls.project_members.setValue(project_memebrs);
        }
      }
    });

    this.getCustomers();
  }

  progressFromTasks(event: any) {
    if (event.detail.checked == true) {
      this.formGroup.controls.progress.disable();
    } else {
      this.formGroup.controls.progress.enable();
    }
  }

  ngOnInit() {
  this.translateTabs();
    this.authUser = this.authService.auth;
    console.log('this.authUser =>', this.authUser);
    this.project_id = this.project_id ?? this.projectId;
    this.statuses = this.projectHelper.get_project_statuses();

    this.getProject();

    const projectTabs = [];
    for (const tab of this.projectTabs) {
      projectTabs.push(tab.slug);
    }
    console.log(projectTabs);

    this.formGroup = this.fb.group({
      name: ['', [Validators.required]],
      clientid: ['', [Validators.required]],
      progress_from_tasks: [1],
      progress: [{
        value: '',
        disabled: true
      }],
      status: [2],

      billing_type: ['', [Validators.required]],
      project_cost: [''],
      project_rate_per_hour: [''],

      estimated_hours: [''],
      project_members: [],

      start_date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      deadline: [''],
      description: [''],
      custom_fields: this.fb.group({
        projects: this.fb.group([])
      }),
      // contact_notification:['1', [Validators.required]],
      send_created_email: [0],
      settings: this.fb.group({
        available_features: [projectTabs],
        view_tasks: [1],
        create_tasks: [0],
        edit_tasks: [0],
        comment_on_tasks: [0],
        view_task_comments: [0],
        view_task_attachments: [0],
        view_task_checklist_items: [0],
        upload_on_tasks: [0],
        view_task_total_logged_time: [0],
        view_finance_overview: [1],
        upload_files: [1],
        open_discussions: [1],
        view_milestones: [1],
        view_gantt: [1],
        view_timesheets: [1],
        view_activity_log: [1],
        view_team_members: [1],
        hide_tasks_on_main_tasks_table: [0]
      })
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        const data = this.router.getCurrentNavigation().extras.state;
        console.log('project data =>', data);
        if(data.type === 'estimate'){
          this.estimate = data;
          this.estimateItems = this.estimate.items;
          if(this.estimateItems.length){
             this.estimateItems.forEach(item => {
              item.checked = true;
              item.assign =  this.authUser ? this.authUser.data?.staffid : ''
             })
             console.log('this.estimateItems =>', this.estimateItems); 
          }
          this.formGroup.patchValue({ clientid: data.clientid });
        }else{
          this.formGroup.patchValue({ clientid: data.userid });
        }
      }
    });

    if(this.type === 'modal' && this.extraInfo){
      this.formGroup.patchValue({ clientid: this.extraInfo.userid });
    }

    this.settingHelper.settings.subscribe((response) => {
      this.settings = response;
      if (this.settings?.perfex_current_version >= '291') {
        this.formGroup.addControl('contact_notification', this.fb.control('1', [Validators.required]));
        
        if (this.project) {
          this.formGroup.controls.contact_notification.setValue(this.project?.contact_notification ? this.dateTimePipe.transform(this.project?.contact_notification) : '');
        }
      }

      if(this.settings?.perfex_current_version < '294') {
        this.projectTabs = this.projectTabs.filter(tab => tab.slug !== 'project_proposals');
      }
    });
  }
  translateTabs() {
    const itemTabs = this.projectHelper.get_project_tabs_admin();
    this.projectTabs = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }

  get billing_type() {
    return this.formGroup.get('billing_type');
  }

  changeProgress(event) {
    this.progress = event.detail.value;
  }

  viewTaskChange(event: any) {
    if (event.detail.checked) {
      this.formGroup.controls.settings.get('create_tasks').enable();
      this.formGroup.controls.settings.get('edit_tasks').enable();
      this.formGroup.controls.settings.get('comment_on_tasks').enable();
      this.formGroup.controls.settings.get('view_task_comments').enable();
      this.formGroup.controls.settings.get('view_task_attachments').enable();
      this.formGroup.controls.settings.get('view_task_checklist_items').enable();
      this.formGroup.controls.settings.get('upload_on_tasks').enable();
      this.formGroup.controls.settings.get('view_task_total_logged_time').enable();

    } else {
      this.formGroup.controls.settings.get('create_tasks').disable();
      this.formGroup.controls.settings.get('edit_tasks').disable();
      this.formGroup.controls.settings.get('comment_on_tasks').disable();
      this.formGroup.controls.settings.get('view_task_comments').disable();
      this.formGroup.controls.settings.get('view_task_attachments').disable();
      this.formGroup.controls.settings.get('view_task_checklist_items').disable();
      this.formGroup.controls.settings.get('upload_on_tasks').disable();
      this.formGroup.controls.settings.get('view_task_total_logged_time').disable();
    }
  }

  getCustomers() {
    this.customerApi.get('', '', null, null,{active: '1'}).subscribe({
      next: (res) => {
        this.customers.push(...res);
        this.customers = [...new Map(this.customers.map(item => [item?.userid, item])).values()];
  
        if (this.project && this.project.clientid != 0) {
          this.formGroup.controls.clientid.setValue(this.project.clientid);
        }
  
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  customerSelect(event: any) {
    console.log(event);

  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  updateProject() {
    this.submitting = true;
    this.projectApi.update(this.project_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:project_updated'));
          if(this.type !== 'modal'){
            this.router.navigate(['/admin/projects/view/' , this.project_id]);
            }else{
              this._openProjectViewModal(this.project_id)
            }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createProject() {
    let Items = [];
    if(this.estimate){
      this.formGroup.value.estimate_id = this.estimate.id;
      Items = this.estimateItems.length ? this.estimateItems.filter(item => item.checked === true): []; 
    }
    this.submitting = true;
    this.projectApi.store(this.formGroup.value, Items).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:project_created'));
          if(this.type !== 'modal'){
            this.router.navigate(['/admin/projects/view/' , res.insert_id]);
          }else{
            this._openProjectViewModal(res.insert_id)
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }
 async _openProjectViewModal(projectId: any){
    this.close(true, 'data');
     const modal = await this.modalCtrl.create({
      component: ViewProjectPage,
      mode: 'ios',
      componentProps: {
        projectId: projectId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if(modalFilters.data){
       
      }
    });
    return await modal.present();
  }
  searchCustomers(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.customerApi.get('', searchText, 0, 20, { active: '1' }).subscribe({
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
  searchStaffs(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.staffApi.get('', searchText, 0, 20, { active: '1' }).subscribe({
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
