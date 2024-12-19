import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { CommonApiService } from 'src/app/services/common-api.service';
import { format, parseISO } from 'date-fns';
import { PaymentApiService } from 'src/app/services/payment-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.page.html',
  styleUrls: ['./create-payment.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePaymentPage implements OnInit {
  @Input() invoice: any;

  formGroup: UntypedFormGroup;
  submitting = false;

  payment_modes : any;
  isDateModalOpen = false;

  constructor(
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private commonApi: CommonApiService,
    private paymentApi: PaymentApiService,
    private dateTimePipe: DateTimePipe
  ) { 
    
  }

  ngOnInit() {
   
    console.log(this.invoice);

    this.formGroup = this.fb.group({
      amount: [this.invoice.total_left_to_pay, 
        [
          Validators.required,
          Validators.max(this.invoice?.total_left_to_pay),
          Validators.min(0)
        ]
      ],
      date: [format(new Date(), 'yyyy-MM-dd'), [Validators.required]],
      paymentmode: ['', [Validators.required]],
      do_not_send_email_template: [false],
      transactionid: [''],
      invoiceid: [this.invoice.id],
      note: ['']
    });

    this.commonApi.payment_mode().subscribe({
      next: response => {
        this.payment_modes = response.filter(mode => {
          return (this.invoice.allowed_payment_modes.includes(mode.id) ? true : false);
        });
        console.log('payment_modes =>', this.payment_modes);
      }
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  createPayment() {
    console.log(this.formGroup);
    this.submitting = true;
    this.paymentApi.store(this.formGroup.value).subscribe({
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

  formatDate(value: any) {
    return  this.dateTimePipe.transform(value);
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
}
