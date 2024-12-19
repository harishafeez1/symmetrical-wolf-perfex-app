import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { TaskApiService } from 'src/app/services/task-api.service';

@Component({
  selector: 'app-create-timesheet',
  templateUrl: './create-timesheet.page.html',
  styleUrls: ['./create-timesheet.page.scss'],
  providers: [DateTimePipe]
})
export class CreateTimesheetPage implements OnInit {
  @Input() task: any;
  @Input() project_id: any;
  @Input() timesheet: any;
  isTimeDuration = false;

  formGroup: FormGroup;
  submitting = false;

  staffs = [];
  tasks = [];
  isEndTimeModalOpen = false;
  isStartTimeModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    public taskApi: TaskApiService,
    private staffApi: StaffApiService,
    private dateTimePipe: DateTimePipe
  ) { 
    
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      timesheet_duration: [''],
      start_time: [this.dateTimePipe.transform(new Date(), 'datetime'), [Validators.required]],
      end_time: [this.dateTimePipe.transform(new Date(), 'datetime'), [Validators.required]],
      timesheet_staff_id: ['', [Validators.required]],
      timesheet_task_id: [this.task, [Validators.required]],
      note: ['']
    });

    if(this.timesheet) {
      this.formGroup.controls.start_time.setValue(this.timesheet.start_time ? this.dateTimePipe.transform(this.timesheet.start_time, 'datetime') : ''); 
      this.formGroup.controls.end_time.setValue(this.timesheet.end_time ? this.dateTimePipe.transform(this.timesheet.end_time, 'datetime') : ''); 
      this.formGroup.controls.note.setValue(this.timesheet.note); 
    }

    if(this.project_id) {
      this.formGroup.addControl('project_id', this.fb.control(this.project_id));

      this.taskApi.get('', '', null, null, {
        rel_type: 'project',
        rel_id: this.project_id
      }).subscribe({
        next: (tasks: any) => {
          if(tasks.status !== false) {
            this.tasks = tasks;
  
            if(this.timesheet) {
              this.formGroup.get('timesheet_task_id').setValue((this.task));
              // this.taskSelect(this.timesheet);
            }
          }
        }
      });
    }

    if(this.task?.assignees) {
      this.staffs = this.task.assignees;
      
      if (this.timesheet) {
        this.formGroup.get('timesheet_staff_id').setValue(this.timesheet.staff_id);
      }
    }

    console.log('testing:::::', this.timesheet, this.project_id, this.task);
  }

  taskSelect(event: any) {
    if(event.value?.assignees) {
      this.staffs = event.value.assignees;
    }
  }

  changeTimeIntoDuration() {
    this.isTimeDuration = !this.isTimeDuration;

    if(this.isTimeDuration) {
      
      this.formGroup.controls.timesheet_duration.setValidators([Validators.required]);
      this.formGroup.controls.start_time.clearValidators();
      this.formGroup.controls.end_time.clearValidators();
      console.log(this.formGroup);
    }

    if(!this.isTimeDuration) {
      this.formGroup.controls.timesheet_duration.clearValidators();
      this.formGroup.controls.start_time.setValidators([Validators.required]);
      this.formGroup.controls.end_time.setValidators([Validators.required]);
    }

    this.formGroup.controls.timesheet_duration.updateValueAndValidity();
    this.formGroup.controls.start_time.updateValueAndValidity();
    this.formGroup.controls.end_time.updateValueAndValidity();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createTimeSheet() {
    this.submitting = true;
    this.taskApi.store_time(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:timesheet_created'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  updateTimeSheet() {
    this.submitting = true;
    this.taskApi.update_time(this.timesheet.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:timesheet_updated'));
          this.modalCtrl.dismiss(true);
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
    return this.dateTimePipe.transform(value, 'datetime');
  }
  
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
  startDateTime(value: any){
    this.formGroup.controls.start_time.setValue(this.formatDate(value));
  }
  endDateTime(value: any){
    this.formGroup.controls.end_time.setValue(this.formatDate(value));
  }
}
