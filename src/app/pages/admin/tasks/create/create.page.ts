import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInput, ModalController, NavController, ToastController } from '@ionic/angular';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';
import { CommonApiService } from 'src/app/services/common-api.service';
import { format, parseISO } from 'date-fns';
import { TaskApiService } from 'src/app/services/task-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ViewPage } from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { MilestoneApiService } from 'src/app/services/milestone-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { TranslateService } from '@ngx-translate/core';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit {
  @ViewChild('portComponent', { static: true }) portComponent: IonicSelectableComponent;
  @Input() extraInfo: any;
  @Input() taskId: any;
  @Input() type = '';
  task_id = this.activatedRoute.snapshot.paramMap.get('id');
  formGroup: UntypedFormGroup;

  task: any;

  isLoading = true;
  submitting = false;

  priorities = [];
  rel_data = [];
  milestones = [];
  checklistTemplates = [];
  assigneesList = [];
  followersList = [];
  commonApiSubscription: Subscription;
  @ViewChild('myInput') myInput: IonInput | undefined;
  tags: any[] = [];
  isDueDateModalOpen = false;
  isStartDateModalOpen = false;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    public taskApi: TaskApiService,
    private commonApi: CommonApiService,
    public taskHelper: TasksHelper,
    private router: Router,
    private modalCtrl: ModalController,
    private dateTimePipe: DateTimePipe,
    private milestoneApi: MilestoneApiService,
    private staffApi: StaffApiService,
    private translate: TranslateService,
    private animationService: AnimationService,
  ) {
  }

  getTask() {

    if (this.task_id) {
      this.isLoading = true;
      this.taskApi.get(this.task_id).subscribe({
        next: (res: any) => {
          this.task = res;
  
          this.rel_data.push(this.task.relational_values);
          
          this.formGroup.patchValue({
            name: this.task.name,
            hourly_rate: this.task.hourly_rate,
            startdate: (this.task && this.task.startdate) ? this.dateTimePipe.transform(this.task.startdate) : '',
            duedate: (this.task && this.task.duedate) ? this.dateTimePipe.transform(this.task.duedate) : '',
            priority: parseInt(this.task.priority),
  
            repeat_every: this.task.custom_recurring == 1 ? 'custom' : (this.task.repeat_every == 0 || this.task.repeat_every == null ? '' : this.task.repeat_every + '-' + this.task.recurring_type),
            repeat_every_custom: this.task.custom_recurring == 1 ? this.task.repeat_every : '',
            repeat_type_custom: this.task.custom_recurring == 1 ? this.task.recurring_type : '',
            cycles: this.task.cycles,
  
            rel_type: this.task.rel_type,
            rel_id: this.task.rel_id,
            description: this.task.description ? this.task.description.replaceAll('<br />', '') : '',
            is_public: this.task.is_public == '1' ? true : false,
            billable: this.task.billable == '1' ? true : false,
            visible_to_client: (this.task && this.task.visible_to_client) == '1' ? true : false
          });
          this.tags = (this.task && this.task.tags && this.task.tags.length) ? this.task.tags.split(',') : []
  
          if (this.task.cycles != 0) {
            this.formGroup.controls.cycles.enable();
          }
  
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
    this.translatePriorities();

    if (this.rel_type?.value == 'project') {
      this.getMilestones(this.rel_id?.value);
    }
    if(!this.task_id){
      this.taskApi.getChecklistItemTemplate().subscribe({
        next: (res: any) =>{
          if(res.status !== false){
            this.checklistTemplates = res;
          }
        }
      })

      this.staffApi.get().subscribe({
        next: (response: any) => {
          if (response.status !== false) {
            this.assigneesList = this.followersList = response;
  
          }
        }
      });
    }

  }
  translatePriorities() {
    this.priorities = this.taskHelper.get_tasks_priorities();
    const itemTabs = this.taskHelper.get_tasks_priorities();
    this.priorities = itemTabs.map(item => ({
      ...item,
      name: this.translate.instant(item.name)
    }));
  }
  ngOnInit() {
    console.log('extraInfo =>', this.extraInfo);
    console.log('type =>', this.type);
    this.task_id = this.task_id ?? this.taskId;

    this.formGroup = this.fb.group({
      name: ['', [Validators.required]],
      hourly_rate: [0],
      startdate: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      duedate: [''],
      priority: [2],

      repeat_every: [''],
      repeat_every_custom: [''],
      repeat_type_custom: ['day'],
      cycles: [{
        value: 0,
        disabled: true
      }],
      rel_type: [''],
      rel_id: [''],
      description: [''],
      is_public: [false],
      billable: [true],
      visible_to_client: [true],
      custom_fields: this.fb.group({
        tasks: this.fb.group([])
      }),
      milestone: [''],
      checklist_items: [''],
      assignees: [''],
      followers: ['']
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
        const data = this.router.getCurrentNavigation().extras.state;

        this.rel_data.push(data.relational_values);

        this.formGroup.patchValue({
          rel_type: data.rel_type,
          rel_id: data.rel_id
        });


        this.portComponent.items.push(data.relational_values);
        this.portComponent.searchText = data.rel_name;
      }
    });

    if (this.extraInfo && this.type === 'modal') {
      console.log('this.extraInfo 11 =>', this.extraInfo);

      this.rel_data.push(this.extraInfo.relational_values);

      this.formGroup.patchValue({
        rel_type: this.extraInfo.rel_type,
        rel_id: this.extraInfo.rel_id
      });
      

      this.portComponent.items.push(this.extraInfo.relational_values);
      this.portComponent.searchText = this.extraInfo.rel_name;
      console.log('this.rel_data 11=>', this.rel_data);
      console.log('this.formGroup 11=>', this.formGroup.value);
    }

    this.getTask();
  }

  get cycles() {
    return this.formGroup.get('cycles');
  }

  get rel_type() {
    return this.formGroup.get('rel_type');
  }

  get rel_id() {
    return this.formGroup.get('rel_id');
  }

  get repeat_every() {
    return this.formGroup.get('repeat_every');
  }

  removeSelectedData() {
    // this.rel_data = [];
    this.formGroup.patchValue({
      rel_id: ''
    });
  }
  addTag(input: IonInput) {
    const value =  input.value;
    if (value && this.tags.indexOf(value) === -1) {
      this.tags.push(value);
      input.value = '';// Clear the input after adding tag
    }
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }
  getRelationData(event: { component: IonicSelectableComponent, text: string }) {
    // console.log('event.text =>', event.text);
    event.component.items = [];
    let text = event.text ? event.text.trim() : '';
    event.component.startSearch();

    // Close any running subscription.
    if (this.commonApiSubscription) {
      this.commonApiSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.commonApiSubscription) {
        this.commonApiSubscription.unsubscribe();
      }

      // event.component.items = [];
      event.component.endSearch();
      return;
    }

    this.commonApiSubscription = this.commonApi.get_relation_data(this.rel_type.value, '', text).subscribe({
      next: (response: any) => {
        // Subscription will be closed when unsubscribed manually.
        if (this.commonApiSubscription.closed) {
          return;
        }
  
        if (response?.status === false) {
          event.component.items = [];
        } else {
          event.component.items = response;
        }
  
        event.component.endSearch();
      }, error: () => {
        event.component.endSearch();
      }
    });
  }

  getMilestones(project_id) {
    this.milestoneApi.get('', '', 0, 1000, {
      project_id: project_id
    }).subscribe({
      next: (res: any) => {
        if (res.status !== false) {
          this.milestones.push(...res);
          this.milestones = [...new Map(this.milestones.map(item => [item?.id, item])).values()];
  
          if(this.task?.milestone != 0) {
            this.formGroup.get('milestone').setValue(this.task.milestone);
          }
        }
      }
    });
  }

  unlimitedCycleChange(event: any) {
    console.log(event);
    if (event.detail.checked) {
      this.formGroup.controls.cycles.setValue(0);
      this.formGroup.controls.cycles.disable();
    } else {
      this.formGroup.controls.cycles.enable();
    }
  }

  updateTask() {
    this.formGroup.value.tags = this.tags.length ?  this.tags.toString() : '';
    this.submitting = true;
    this.taskApi.update(this.task_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:task_updated'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/tasks/view/', this.task_id]);
          } else {
            this._openViewTaskModal(this.task_id);
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

  createTask() {
    this.formGroup.value.tags = this.tags.length ?  this.tags.toString() : '';
    this.submitting = true;
    this.taskApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:task_created'));
          if (this.type !== 'modal') {
            this.router.navigate(['/admin/tasks/view/', res.insert_id]);
          } else {
            this._openViewTaskModal(res.insert_id);
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

  close() {
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  async _openViewTaskModal(Id: any) {
    console.log('Id =>', Id);
    this.modalCtrl.dismiss(true, 'data');
    const modal = await this.modalCtrl.create({
      component: ViewPage,
      mode: 'ios',
      componentProps: {
        taskId: Id,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if (modalFilters.data) {

      }
    });
    return await modal.present();
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
