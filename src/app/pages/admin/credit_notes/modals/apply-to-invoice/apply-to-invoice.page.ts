import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-apply-to-invoice',
  templateUrl: './apply-to-invoice.page.html',
  styleUrls: ['./apply-to-invoice.page.scss'],
})
export class ApplyToInvoicePage implements OnInit {
  @Input() credit_note: any;
  formGroup: FormGroup;
  available_invoices = [];
  total = 0;
  message = '';
  isLoading = true;
  submitting = false;
  constructor(
    private fb: FormBuilder,
    private creditNoteApi: CreditNoteApiService,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService
  ) { }

  applyCreditsToInvoices() {
    this.submitting = true;
    this.creditNoteApi.apply_credits_to_invoices(this.credit_note.id, this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:note_created'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false
      }, error: () => {
        this.submitting = false
      }
    })
  }

  invoiceCalculations() {
    console.log(this.formGroup);
    this.total = 0;
    for(const input in this.formGroup.value) {
      if(this.formGroup.value[input] != null) {
        this.total += this.formGroup.value[input];
      }
    }
  }

  ngOnInit() {
    this.formGroup = this.fb.group({});
    this.message = '';
    this.creditNoteApi.available_creditable_invoices(this.credit_note.id).subscribe({
      next: (response: any) => {
        if(response.status !== false) {
          const fields = [];
          for(const invoice of response) {
            fields[invoice.id] = [0];
          }
          this.formGroup = this.fb.group(fields);
          this.available_invoices = response;
        } else {
          this.message = 'There are no available invoices for this customer.';
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
