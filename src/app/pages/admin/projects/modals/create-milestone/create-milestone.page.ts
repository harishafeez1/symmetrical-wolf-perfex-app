import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { SettingsHelper } from 'src/app/classes/settings-helper';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { MilestoneApiService } from 'src/app/services/milestone-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-create-milestone',
  templateUrl: './create-milestone.page.html',
  styleUrls: ['./create-milestone.page.scss'],
  providers: [DateTimePipe]
})
export class CreateMilestonePage implements OnInit {
  @Input() project_id: any;
  @Input() milestone: any;

  formGroup: UntypedFormGroup;
  submitting = false;
  settings: any;
  isDueDateModalOpen = false;
  isStartDateModalOpen = false;

  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private milestoneApi: MilestoneApiService,
    private settingHelper: SettingsHelper,
    private dateTimePipe: DateTimePipe
  ) {
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required]],
      due_date: [this.dateTimePipe.transform(new Date()), [Validators.required]],
      project_id: [this.project_id],
      description: [''],
      description_visible_to_customer: [0],
      milestone_order: [''],
    });


    if (this.milestone) {
      this.formGroup.controls.name.setValue(this.milestone.name);
      this.formGroup.controls.due_date.setValue(this.milestone.due_date ? this.dateTimePipe.transform(this.milestone.due_date) : '');
      this.formGroup.controls.description.setValue(this.milestone.description ? this.milestone.description.replaceAll('<br />', '') : '');
      this.formGroup.controls.description_visible_to_customer.setValue(parseInt(this.milestone.description_visible_to_customer));
      this.formGroup.controls.milestone_order.setValue(this.milestone.milestone_order);
    }

    this.settingHelper.settings.subscribe((response) => {
      console.log(response);
      this.settings = response;
      if (this.settings.perfex_current_version >= '294') {
        this.formGroup.addControl('start_date', this.fb.control(this.dateTimePipe.transform(new Date()), [Validators.required]));
        if (this.milestone) {
          this.formGroup.controls.start_date.setValue(this.milestone?.start_date ? this.dateTimePipe.transform(this.milestone?.start_date) : '');

        }
      }
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createMilestone() {
    console.log(this.formGroup);
    this.submitting = true;
    this.milestoneApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:milestone_created'));
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

  updateMilestone() {
    console.log(this.formGroup);
    this.submitting = true;
    this.milestoneApi.update(this.milestone.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:milestone_updated'));
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
    return this.dateTimePipe.transform(value);
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
}
