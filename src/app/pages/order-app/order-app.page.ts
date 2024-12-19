import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { OrderAppService } from 'src/app/services/order-app.service';

@Component({
  selector: 'app-order-app',
  templateUrl: './order-app.page.html',
  styleUrls: ['./order-app.page.scss'],
})
export class OrderAppPage implements OnInit {

  formGroup: UntypedFormGroup;
  isLoading = false;
  submitting = false;
  
  constructor(private modalCtrl: ModalController,private fb: UntypedFormBuilder,
    private orderApi: OrderAppService,private mpcToast: MpcToastService,) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      status: ['2', [Validators.required]],
      source: ['1', [Validators.required]],
      name: ['', [Validators.required]],
      assigned: [''],
      title: [''],
      email: ['', [Validators.required,Validators.email]],
      website: ['', [Validators.required]],
      phonenumber: ['', [Validators.required]],
      lead_value: [''],
      company: [''],

      default_language: [''],
      description: ['',[Validators.required]],
      is_public: [false],
      contacted_today: [true],
      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: [''],
      custom_fields: this.fb.group({
        leads: this.fb.group([])
      })
    });
  }

  order() {

    this.submitting = true;
    this.orderApi.purchaseApp(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.close();
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = true;
      }, error: () => {
        this.submitting = true;
      }
    });
  }
  close() {
    this.modalCtrl.dismiss();
  }

}
