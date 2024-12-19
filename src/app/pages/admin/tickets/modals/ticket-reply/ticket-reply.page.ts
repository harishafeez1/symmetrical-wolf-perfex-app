import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { EditorOption } from 'src/app/constants/editor';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { TicketApiService } from 'src/app/services/ticket-api.service';

@Component({
  selector: 'app-ticket-reply',
  templateUrl: './ticket-reply.page.html',
  styleUrls: ['./ticket-reply.page.scss'],
})
export class TicketReplyPage implements OnInit {
  @Input() ticket: any;

  formGroup: UntypedFormGroup;
  submitting = false;

  emails = [];
  statuses = [];

  editorOption = EditorOption;
  
  files: File[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private ticketApi: TicketApiService,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
  ) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      message: [''],
      email: [this.ticket.ticket_email],
      cc: [this.ticket?.cc],
      ticketid: [this.ticket.ticketid],
      assign_to_current_user: [],
      status: []
    });

    this.ticketApi.getStatuses().subscribe({
      next: (statuses: any) => {
        if (statuses?.status !== false) {
          this.statuses = statuses;
  
          if(this.ticket) {
            this.formGroup.controls.status.setValue(this.ticket.status);
          }
        }
      }
    });
  }

  sendReply() {
    console.log(this.formGroup);
    this.submitting = true;
    this.formGroup.value.attachments = this.files;
    this.ticketApi.addReply(this.ticket.ticketid, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:payment_created'));
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

  close() {
    this.modalCtrl.dismiss();
  }

  onSelect(event) {
    console.log(event);
    if(event.rejectedFiles.length > 0){
      this.mpcToast.show(`You can't upload files of this type`, 'danger');
      return;
    }
    if (event.addedFiles.length > 0) {
      let fileSizeUp = [];
      for(let file of event.addedFiles){
        var fileSizeInBytes = file.size;
        var fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
        if (fileSizeInMB > 2) {
          fileSizeUp.push(file.name);
        } 
      }
      if(fileSizeUp.length > 0){
        this.mpcToast.show(`${fileSizeUp.join(', ')} file size must be less than or equal to 2MB.`, 'danger');
        return;
      }
      
  }

    this.files.push(...event.addedFiles);
  }
  
  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
