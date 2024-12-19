import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { TaskApiService } from 'src/app/services/task-api.service';

@Component({
  selector: 'app-create-comment',
  templateUrl: './create-comment.page.html',
  styleUrls: ['./create-comment.page.scss'],
})
export class CreateCommentPage implements OnInit {

  @Input() task: any;
  @Input() comment: any;
  isButtonDisabled = false;
  submitting = false;

  formGroup: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    public taskApi: TaskApiService
  ) { 
    
  }

  ngOnInit() {
   
    console.log(this.task);

    this.formGroup = this.fb.group({
      taskid: [this.task.id],
      content: ['', Validators.required]
    });

    if(this.comment) {
      this.formGroup.controls.content.setValue(this.comment.content); 
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createComment() {
    this.isButtonDisabled = true;
    this.submitting = true;
    console.log(this.formGroup);
    this.taskApi.addComment(this.formGroup.value).subscribe({
      next: (res: any) => {
        this.isButtonDisabled = false;
        this.submitting = false;
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:comment_created'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }, error: () => {
        this.isButtonDisabled = false;
        this.submitting = false;
      }
    });
  }

  updateComment() {
    this.isButtonDisabled = true;
    this.submitting = true;
    console.log(this.formGroup);
    this.taskApi.updateComment(this.comment.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        this.isButtonDisabled = false;
        this.submitting = false;
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:comment_updated'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
      }, error: () => {
        this.isButtonDisabled = false;
        this.submitting = false;
      }
    });
  }

  formatDate(value: string) {
    return format(parseISO(value), 'yyyy-MM-dd');
  }
}
