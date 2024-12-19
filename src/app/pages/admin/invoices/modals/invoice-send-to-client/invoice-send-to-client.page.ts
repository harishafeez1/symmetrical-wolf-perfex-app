import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { EditorOption } from 'src/app/constants/editor';
import { ContactApiService } from 'src/app/services/contact-api.service';
import { InvoiceApiService } from 'src/app/services/invoice-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-invoice-send-to-client',
  templateUrl: './invoice-send-to-client.page.html',
  styleUrls: ['./invoice-send-to-client.page.scss'],
})
export class InvoiceSendToClientPage implements OnInit {
  @Input() invoice: any;
  formGroup: FormGroup;
  submitting = false;
  contacts = [];

  editorOption = EditorOption;

  constructor(
    private fb: FormBuilder,
    private contactApi: ContactApiService,
    private invoiceApi: InvoiceApiService,
    private mpcToast: MpcToastService,
    private modalCtrl: ModalController
  ) { }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.contactApi.get('', '', null, null, {
      userid: this.invoice.clientid,
      active: 1,
      invoice_emails: 1
    }).subscribe({
      next: (response: any) => {
        if(response.status !== false) {
          this.contacts = response;
        }
      }
    });

    this.formGroup = this.fb.group({
      sent_to: [''],
      cc: [''],
      attach_pdf: [true],
      attach_statement: [false],
      email_template_custom: [this.invoice?.email_data?.template?.message],
      template_name: [this.invoice?.email_data?.template_name]
    });
  }

  sendToEmail() {
    this.submitting = true;
    this.invoiceApi.sendToEmail(this.formGroup.value, this.invoice.id).subscribe({
      next: (response: any) => {
        if(response.status) {
          this.mpcToast.show(response.message);
          this.modalCtrl.dismiss();
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }
}
