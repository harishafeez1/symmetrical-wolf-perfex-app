import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AttachFileApiService } from 'src/app/services/attach-file-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-attach-file',
  templateUrl: './attach-file.page.html',
  styleUrls: ['./attach-file.page.scss'],
})
export class AttachFilePage implements OnInit {

  @Input() proposal_id: any;
  @Input() rel_type: any;
  @Input() rel_id: any;

  file: File;
  formGroup: UntypedFormGroup;
  isProgressBar = false;
  constructor(
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private attachFileApi: AttachFileApiService
  ) { 
    
  }

  ngOnInit() {
  }

  close() {
    console.log('dismiss ............')
    this.modalCtrl.dismiss(false, 'dismiss');
  }

  onSelect(event) {
    console.log('onSelect img =>', event);
    if(event.rejectedFiles.length > 0){
      this.mpcToast.show(`You can't upload files of this type`, 'danger');
      return;
    }

    if (event.addedFiles.length > 0) {
      var fileSizeInBytes = event.addedFiles[0].size;
      var fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB

      if (fileSizeInMB > 2) {
        this.mpcToast.show('File size must be less than or equal to 2MB.', 'danger');
        return;
      } 
  }
   
    this.file = event.addedFiles[0];
    const data = {
      type: this.rel_type,
      rel_id: this.rel_id,
      file: this.file
    }
    this.isProgressBar = true;
    this.attachFileApi.addAttachment(data).subscribe({
      next: (response: any) => {
        this.isProgressBar = false;
        if (response.success) {
          this.mpcToast.show('attachment uploaded successfully.');
          this.modalCtrl.dismiss(true, 'data');
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }, error: () => {
        this.isProgressBar = false;
      }
    });
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }

}
