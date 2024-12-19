import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ContractApiService } from 'src/app/services/contract-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-create-comment',
  templateUrl: './create-comment.page.html',
  styleUrls: ['./create-comment.page.scss'],
})
export class CreateCommentPage implements OnInit {

  @Input() contract: any;
  @Input() comment: any;

  formGroup: UntypedFormGroup;
  isLoading = false;
  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private contractApi: ContractApiService
  ) { 
    
  }

  ngOnInit() {
   
    console.log(this.contract);

    this.formGroup = this.fb.group({
      contract_id: [this.contract.id],
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
    this.contractApi.addComment(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
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
    this.contractApi.updateComment(this.comment.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
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

}
