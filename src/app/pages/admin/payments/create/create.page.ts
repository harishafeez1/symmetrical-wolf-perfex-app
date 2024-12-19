import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { CommonApiService } from 'src/app/services/common-api.service';
import { format, parseISO } from 'date-fns';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { ProjectApiService } from 'src/app/services/project-api.service';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { PaymentApiService } from 'src/app/services/payment-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import {ViewPage as ViewPaymentPage} from '../view/view.page';
import { DateTimePipe } from 'src/app/pipes/date-time.pipe';
import { AnimationService } from 'src/app/services/animation.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  providers: [DateTimePipe]
})
export class CreatePage implements OnInit {
  payment_id = this.activatedRoute.snapshot.paramMap.get('id');
  @Input() paymentId: any;
  @Input() type = '';
  formGroup: FormGroup;
  payment: any;
  isLoading = true;
  submitting = false;
  payment_modes: any;
  isDateModalOpen = false;

  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private mpcToast: MpcToastService,
    private paymentApi: PaymentApiService,
    private commonApi: CommonApiService,
    private modalCtrl: ModalController,
    private router: Router,
    private dateTimePipe: DateTimePipe,
    private animationService: AnimationService,
  ) {
  }

  getPayment() {   
    if (this.payment_id) {
      this.isLoading = true;
      this.paymentApi.get(this.payment_id).subscribe({
        next: (res: any) => {
          this.payment = res;
          this.formGroup.patchValue({
            amount: this.payment.amount,
            date: this.payment.date,
            paymentmethod: this.payment.paymentmethod,
            transactionid: this.payment.transactionid,
            note: this.payment.note ? this.payment.note.replaceAll('<br />', '') : ''
          });
          this.loadApiData();
          this.isLoading = false;
        }, error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadApiData();
    }
  }

  loadApiData() {
    this.commonApi.payment_mode().subscribe({
      next: response => {
        this.payment_modes = response;
        if (this.payment) {
          this.formGroup.controls.paymentmode.setValue(this.payment.paymentmode);
        }
      }
    });
  }

  ngOnInit() {
    this.payment_id = this.payment_id ?? this.paymentId;
    this.getPayment();

    this.formGroup = this.fb.group({
      amount: ['', [Validators.required]],
      date: [format(new Date(), 'yyyy-MM-dd'), [Validators.required]],
      paymentmode: [''],
      paymentmethod: [''],
      transactionid: [''],
      note: ['']
    });
  }

  updatePayment() {
    this.submitting = true;
    this.paymentApi.update(this.payment_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:payment_updated'));
          if(this.type !== 'modal'){
            this.router.navigate(['/admin/payments/view/' , this.payment_id]);
          }else{
            this._openPaymentViewModal(this.payment_id);
          }
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createPayment() {
    this.submitting = true;
    this.paymentApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:payment_created'));
          this.router.navigate(['/admin/payments/view/' , res.insert_id]);
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
    return this.dateTimePipe.transform(value);
  }
  parseDate(value: any, type = 'date') {
    const val = value ? value : new Date();
    return this.dateTimePipe.transform(val, type, 'parseDate');
  }
  close(data = false, role = 'dismiss') {
    this.modalCtrl.dismiss(data, role);
  }
 async _openPaymentViewModal(paymentId: any){
    this.close(true, 'data');
     const modal = await this.modalCtrl.create({
      component: ViewPaymentPage,
      mode: 'ios',
      componentProps: {
        paymentId: paymentId,
        type: 'modal'
      },      
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
    });
    modal.onDidDismiss().then((modalFilters) => {
      console.log('modalFilters create =>', modalFilters);
      if(modalFilters.data){
       
      }
    });
    return await modal.present();
  }
}
