import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { ProposalApiService } from 'src/app/services/proposal-api.service';

@Component({
  selector: 'app-create-comment',
  templateUrl: './create-comment.page.html',
  styleUrls: ['./create-comment.page.scss'],
})
export class CreateCommentPage implements OnInit {

  @Input() proposal: any;
  @Input() comment: any;

  formGroup: UntypedFormGroup;
  isLoading = false;
  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private proposalApi: ProposalApiService
  ) { 
    
  }

  ngOnInit() {
   
    console.log(this.proposal);

    this.formGroup = this.fb.group({
      proposalid: [this.proposal.id],
      content: ['', Validators.required]
    });

    if(this.comment) {
      this.formGroup.controls.content.setValue(this.comment.content ? this.comment.content.replaceAll('<br />', '') : ''); 
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createComment() {
    console.log(this.formGroup);
    this.isLoading = true;
    this.proposalApi.addComment(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:comment_created'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  updateComment() {
    console.log(this.formGroup);
    this.isLoading = true;
    this.proposalApi.updateComment(this.comment.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:comment_updated'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  formatDate(value: string) {
    return format(parseISO(value), 'yyyy-MM-dd');
  }
}
