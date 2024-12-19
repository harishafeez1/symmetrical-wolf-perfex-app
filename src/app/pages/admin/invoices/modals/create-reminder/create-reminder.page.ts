import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ReminderApiService } from 'src/app/services/reminder-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';

@Component({
  selector: 'app-create-reminder',
  templateUrl: './create-reminder.page.html',
  styleUrls: ['./create-reminder.page.scss'],
  providers: [DateTimePipe]
})
export class CreateReminderPage implements OnInit {
  @Input() rel_id: any;
  @Input() rel_type: any;
  @Input() reminder: any;

  formGroup: UntypedFormGroup;
  submitting = false;
  staffs = [];
  isDateModalOpen = false;

  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private reminderApi: ReminderApiService,
    private staffApi: StaffApiService,
    private dateTimePipe: DateTimePipe
  ) { 
    
  }

  ngOnInit() {
    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
  
        if (this.reminder) {
          this.formGroup.controls.staff.setValue(this.reminder.staff);
        }
      }
    });

    console.log((new Date()).toISOString());
    this.formGroup = this.fb.group({
      rel_type: [this.rel_type],
      rel_id: [this.rel_id],
      date: [this.dateTimePipe.transform(new Date(), 'datetime'), [Validators.required]],
      staff: ['', [Validators.required]],
      description: ['', [Validators.required]],
      notify_by_email: [0]
    });

    if(this.reminder) {
      this.formGroup.controls.description.setValue(this.reminder.description ? this.reminder.description.replaceAll('<br />', '') : ''); 
    
      this.formGroup.controls.date.setValue(this.dateTimePipe.transform(new Date(), 'datetime')); 
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createReminder() {
    console.log(this.formGroup);
    this.submitting = true;
    this.reminderApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:reminder_created'));
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

  updateReminder() {
    console.log(this.formGroup);
    this.submitting = true;
    this.reminderApi.update(this.reminder.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:reminder_updated'));
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
}
