import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.page.html',
  styleUrls: ['./create-activity.page.scss'],
})
export class CreateActivityPage implements OnInit {
  @Input() lead_id: any;

  formGroup: UntypedFormGroup;
  submitting = false;

  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private leadApi: LeadApiService,
  ) { 
    
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      activity: ['', Validators.required]
    });
  }

  close() {
    this.modalCtrl.dismiss(false);
  }

  createActivity() {
    console.log(this.formGroup);
    const data = {
      leadid: this.lead_id,
      activity: this.formGroup.value.activity
    }
    this.submitting = true;
    this.leadApi.addActivity(data).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
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


}
