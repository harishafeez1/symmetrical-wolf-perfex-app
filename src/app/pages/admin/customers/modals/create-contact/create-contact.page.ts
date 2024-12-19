import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ContactApiService } from 'src/app/services/contact-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.page.html',
  styleUrls: ['./create-contact.page.scss'],
})
export class CreateContactPage implements OnInit {
  @Input() userid: any;
  @Input() contact: any;

  showPassword = false;
  formGroup: UntypedFormGroup;
  submitting = false;
  file: File;
  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private contactApi: ContactApiService
  ) {

  }

  ngOnInit() {
    console.log('contact =>', this.contact);
    console.log('userid =>', this.userid);

    this.formGroup = this.fb.group({
      customer_id: [this.userid, [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      title: [''],
      email: ['', [Validators.required, Validators.email]],
      phonenumber: [''],
      direction: ['ltr'],
      custom_fields: this.fb.group({
        contacts: this.fb.group([])
      }),
      password: [''],
      is_primary: [],
      donotsendwelcomeemail: [],
      send_set_password_email: [],
      permissions: this.fb.group({ 1: [1], 2: [2], 3: [3], 4: [4], 5: [5], 6: [6] }),
      invoice_emails: ['invoice_emails'],
      estimate_emails: ['estimate_emails'],
      credit_note_emails: ['credit_note_emails'],
      project_emails: ['project_emails'],
      ticket_emails: ['ticket_emails'],
      task_emails: ['task_emails'],
      contract_emails: ['contract_emails']
    });

    if (this.contact) {
      let __permissions = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
      for (let permission of this.contact.permissions) {
        __permissions[permission.permission_id] = permission.permission_id;
      }

      this.formGroup.patchValue({
        firstname: this.contact.firstname,
        lastname: this.contact.lastname,
        title: this.contact.title,
        email: this.contact.email,
        phonenumber: this.contact.phonenumber,
        direction: this.contact.direction,
        // password: this.contact.password,
        is_primary: parseInt(this.contact.is_primary),
        donotsendwelcomeemail: parseInt(this.contact.donotsendwelcomeemail),
        send_set_password_email: parseInt(this.contact.send_set_password_email),
        permissions: __permissions,
        invoice_emails: parseInt(this.contact.invoice_emails),
        estimate_emails: parseInt(this.contact.estimate_emails),
        credit_note_emails: parseInt(this.contact.credit_note_emails),
        project_emails: parseInt(this.contact.project_emails),
        ticket_emails: parseInt(this.contact.ticket_emails),
        task_emails: parseInt(this.contact.task_emails),
        contract_emails: parseInt(this.contact.contract_emails)
      });
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createContact() {
    console.log(this.formGroup);
    this.submitting = true;
    this.contactApi.store(this.formGroup.value).subscribe({
      next:(res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
  
          window.dispatchEvent(new CustomEvent('admin:contact_created'));
          this.modalCtrl.dismiss(true);
  
          if (this.file != null) {
            this.addAttachments(res.insert_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () =>{
        this.submitting = false;
      }
    });
  }

  updateContact() {
    this.submitting = true;
    this.contactApi.update(this.contact.id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          if (this.file != null) {
            this.addAttachments(this.contact.id);
          }else{
            this.modalCtrl.dismiss(true);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
  
        this.submitting = false;
      }, error: () =>{
        this.submitting = false;
      }
    });
  }

  onSelect(event) {
    console.log(event);
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
    if (this.contact?.attachment) {
      this.deleteContactAttachment(this.contact.id);
    }

    this.file = event.addedFiles[0];
  }

  onRemove(event) {
    console.log(event);
    this.file = null;
  }

  deleteContactAttachment(contact_id) {
    this.contactApi.deleteProfileImage(contact_id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.contact.profile_image = null;
          this.getContact();
          this.mpcToast.show(response.message);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }

  getContact() {
    this.contactApi.get(this.contact.id).subscribe({
      next: (res: any) => {
        if(res.status !== false){
          this.contact = res;
          if (this.contact) {
            let __permissions = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
            for (let permission of this.contact.permissions) {
              __permissions[permission.permission_id] = permission.permission_id;
            }
    
            this.formGroup.patchValue({
              firstname: this.contact.firstname,
              lastname: this.contact.lastname,
              title: this.contact.title,
              email: this.contact.email,
              phonenumber: this.contact.phonenumber,
              direction: this.contact.direction,
              // password: this.contact.password,
              is_primary: parseInt(this.contact.is_primary),
              donotsendwelcomeemail: parseInt(this.contact.donotsendwelcomeemail),
              send_set_password_email: parseInt(this.contact.send_set_password_email),
              permissions: __permissions,
              invoice_emails: parseInt(this.contact.invoice_emails),
              estimate_emails: parseInt(this.contact.estimate_emails),
              credit_note_emails: parseInt(this.contact.credit_note_emails),
              project_emails: parseInt(this.contact.project_emails),
              ticket_emails: parseInt(this.contact.ticket_emails),
              task_emails: parseInt(this.contact.task_emails),
              contract_emails: parseInt(this.contact.contract_emails)
            });
          }
        }
      }
    });
  }

  addAttachments(id) {
    this.contactApi.addProfileImage(id, this.file).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
      }
    });
  }
}
