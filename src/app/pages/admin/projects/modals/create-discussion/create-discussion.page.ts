import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ProjectApiService } from 'src/app/services/project-api.service';

@Component({
  selector: 'app-create-discussion',
  templateUrl: './create-discussion.page.html',
  styleUrls: ['./create-discussion.page.scss'],
})
export class CreateDiscussionPage implements OnInit {
  @Input() project_id: any;
  @Input() discussion: any;

  formGroup: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private projectApi: ProjectApiService
  ) { 
    
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      subject: ['', [Validators.required]],
      project_id: [this.project_id],
      description: [''],
      show_to_customer: [0],
    });
console
    if(this.discussion) {
      this.formGroup.controls.subject.setValue(this.discussion.subject); 
      this.formGroup.controls.description.setValue(this.discussion.description ? this.discussion.description.replaceAll('<br />', '') : ''); 
      this.formGroup.controls.show_to_customer.setValue(parseInt(this.discussion.show_to_customer)); 
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createDiscussion() {
    console.log(this.formGroup);
    this.submitting = true;
    this.projectApi.storeDiscussion(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:discussion_created'));
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

  updateDiscussion() {
    console.log(this.formGroup);
    this.formGroup.value.id = this.discussion.id;
    this.submitting = true;
    this.projectApi.updateDiscussion(this.discussion.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:discussion_updated'));
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
