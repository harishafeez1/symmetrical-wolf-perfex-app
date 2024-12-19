import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CountryApiService } from 'src/app/services/country-api.service';
import { CurrencyApiService } from 'src/app/services/currency-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { StaffApiService } from 'src/app/services/staff-api.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit,OnDestroy {
  staff_id = this.activatedRoute.snapshot.paramMap.get('id');
  formGroup: UntypedFormGroup;
  selectedTab = 'profile';
  countries: any;
  languages: any;
  currencies: any;
  groups: any;
  staff: any;
  isLoading = true;
  submitting = false;
  departments = [];
  private language$: Subscription;
  showPassword = false;
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private countryApi: CountryApiService,
    private currencyApi: CurrencyApiService,
    private staffApi: StaffApiService,
    private router: Router
  ) {
  }

  getStaff() {
    if (this.staff_id !== null) {
      this.isLoading = true;
      this.staffApi.get(this.staff_id).subscribe({
        next: (res) => {
          this.staff = res;
          for (let key in res) {
            if (['is_not_staff', 'administrator'].includes(key)) {
              this.formGroup.controls[key].setValue(res[key] === '1' ? true : false);
              continue;
            }
  
            if (key === 'email_signature') {
              res[key] = res[key] ? res[key].replaceAll('<br />', '') : '';
            }
            if (this.formGroup.controls[key] && key !== 'password') {
              this.formGroup.controls[key].setValue(res[key]);
            }
          }
  
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
    this.staffApi.getDepartments().subscribe({
      next: (departments: any) => {
        if (departments?.status !== false) {
          this.departments = departments;
          if (this.staff) {
            const departmentId = [];
            for (let department of this.staff.departments) {
              departmentId.push(department.departmentid);
            }
            this.formGroup.controls.departments.setValue(departmentId);
          }
        }
      }
    });

    this.language$ = this.countryApi.getLanguageData().subscribe(res =>{
      if(!res){
        this.countryApi.getLanguages().subscribe({
          next: async response => {
            this.countryApi.setLanguageData(response);
          }
        });
      }else{           
        this.languages =  res;
        if (this.staff) {
          this.formGroup.controls.default_language.setValue(this.staff.default_language);
        }
      }
    })
  }

  ngOnInit() {
    this.getStaff();

    this.formGroup = this.fb.group({
      is_not_staff: [false],
      firstname: ['', [Validators.required]],
      lastname: [''],
      email: ['', [Validators.required, Validators.email]],
      hourly_rate: [0],
      phonenumber: [''],
      facebook: [''],
      linkedin: [''],
      skype: [''],
      default_language: [''],

      email_signature: [''],
      direction: [''],
      custom_fields: this.fb.group({
        staff: this.fb.group([])
      }),
      departments: [''],
      administrator: [false],
      send_welcome_email: [{
        value: false,
        disabled: this.staff_id !== null ? true : false
      }],
      password: ['']
    });
  }
  ngOnDestroy() {
    this.language$.unsubscribe();
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  updateStaff() {
    this.submitting = true;
    this.staffApi.update(this.staff_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.router.navigate(['/admin/staffs/view/' + this.staff_id]);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createStaff() {
    this.submitting = true;
    this.staffApi.store(this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.router.navigate(['/admin/staffs/view/' + res.insert_id]);
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
