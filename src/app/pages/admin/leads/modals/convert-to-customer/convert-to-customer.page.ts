import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ContactApiService } from 'src/app/services/contact-api.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';

@Component({
  selector: 'app-convert-to-customer',
  templateUrl: './convert-to-customer.page.html',
  styleUrls: ['./convert-to-customer.page.scss'],
})
export class ConvertToCustomerPage implements OnInit, OnDestroy {
  @Input() leadid: any;
  @Input() lead: any;

  showPassword = false;
  formGroup: FormGroup;
  submitting = false;
  countries = [];
  private country$: Subscription;
  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private mpcToast: MpcToastService,
    private leadApi: LeadApiService,
    private countryApi: CountryApiService
  ) {

  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      leadid: [this.leadid, [Validators.required]],
      firstname: [this.lead.firstname, [Validators.required]],
      lastname: [this.lead.lastname, [Validators.required]],
      title: [this.lead.title],
      email: [this.lead.email, [Validators.required, Validators.email]],
      original_lead_email: [this.lead.email],
      company: [this.lead.company, [Validators.required]],
      phonenumber: [this.lead.phonenumber],
      website: [this.lead.website],
      address: [this.lead.address ? this.lead.address.replaceAll('<br />', '') : ''],
      city: [this.lead.city],
      state: [this.lead.state],
      country: [this.lead.country],
      zip: [this.lead.zipcode],
      // custom_fields: this.fb.group({
      //   contacts: this.fb.group([])
      // }),
      password: [''],
      donotsendwelcomeemail: [],
      send_set_password_email: []
    });

    this.country$ = this.countryApi.getCountriesData().subscribe(async res => {
      if (!res) {
        this.countryApi.get().subscribe({
          next: async response => {
            this.countryApi.setCountriesData(response);
          }
        });
      } else {
        this.countries = await res;
        if (this.lead) {
          this.formGroup.controls.country.setValue(this.lead.country);
        }
      }
    })
  }
  ngOnDestroy(): void {
    this.country$.unsubscribe();
  }
  close() {
    this.modalCtrl.dismiss();
  }

  convertToCustomer() {
    console.log(this.formGroup);
    this.submitting = true;
    this.leadApi.convert_to_customer(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          window.dispatchEvent(new CustomEvent('admin:lead_converted_into_customer'));
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
}
