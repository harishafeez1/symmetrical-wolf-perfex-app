import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { CommonApiService } from 'src/app/services/common-api.service';
import { CreditNoteApiService } from 'src/app/services/credit-note-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-refund',
  templateUrl: './refund.page.html',
  styleUrls: ['./refund.page.scss'],
})
export class RefundPage implements OnInit {
  @Input() credit_note: any;
  @Input() refund: any;

  formGroup: FormGroup;
  submitting =  false;

  payment_modes = [];
  isEstimateDateModalOpen = false;
  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private creditNoteApi: CreditNoteApiService,
    private commonApi: CommonApiService,
    private dateTimePipe: DateTimePipe
  ) {
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      amount: [(this.refund ? this.refund?.amount :  this.credit_note.remaining_credits), 
        [
          Validators.required,
          Validators.max(this.refund ? parseFloat(this.credit_note.remaining_credits) + parseFloat(this.refund?.amount) : this.credit_note.remaining_credits),
          Validators.min(0)
        ]
      ],
      refunded_on: [this.refund ? this.dateTimePipe.transform(new Date(this.refund.refunded_on)) : this.dateTimePipe.transform(new Date()), [Validators.required]],
      payment_mode: [this.refund ? this.refund.payment_mode_id : '', [Validators.required]],
      note: [this.refund ? this.refund.note : '']
    });

    this.commonApi.payment_mode().subscribe({
      next: response => {
        this.payment_modes = response;
      }
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createRefund() {
    console.log(this.formGroup);
    this.submitting = true;
    this.creditNoteApi.storeRefund(this.credit_note.id, this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:refund_created'));
          this.modalCtrl.dismiss(true, 'data');
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }
  
  editRefund() {
    console.log(this.formGroup);
    this.submitting = true;
    this.creditNoteApi.updateRefund(this.refund.id, this.formGroup.value).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.mpcToast.show(response.message);
          window.dispatchEvent(new CustomEvent('admin:refund_updated'));
          this.modalCtrl.dismiss(true);
        } else {
          this.mpcToast.show(response.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  formatDate(value: any) {
    return this.dateTimePipe.transform(value);
  }

  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
}