import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInput, NavController, ToastController } from '@ionic/angular';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';
import { CountryApiService } from 'src/app/services/country-api.service';
import { MpcToastService } from 'src/app/services/mpc-toast.service';
import { Subscription } from 'rxjs';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit, OnDestroy {
  lead_id = this.activatedRoute.snapshot.paramMap.get('id');
  formGroup: UntypedFormGroup;
  selectedTab = 'lead_details';

  selectedCurrency: any;
  lead: any;
  isLoading = true;
  submitting = false;
  statuses = [];
  sources = [];
  staffs = [];
  languages = [];
  countries = [];
  private language$: Subscription;
  private country$: Subscription;
  @ViewChild('myInput') myInput: IonInput | undefined;
  tags: any[] = [];
  constructor(
    private nav: NavController,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private mpcToast: MpcToastService,
    private staffApi: StaffApiService,
    private leadApi: LeadApiService,
    private countryApi: CountryApiService,
    private router: Router
  ) {
    // this.getLead();
  }

  getLead() {

    if (this.lead_id !== null) {
      this.isLoading = true;
      this.leadApi.get(this.lead_id).subscribe({
        next: (res: any) => {
          this.lead = res;
          this.formGroup.patchValue({
            name: this.lead.name,
            title: this.lead.title,
            email: this.lead.email,
            website: this.lead.website,
            phonenumber: this.lead.phonenumber,
            lead_value: this.lead.lead_value,
            company: this.lead.company,
  
            description: this.lead.description ? this.lead.description.replaceAll('<br />') : '',
            is_public: this.lead.is_public,
            address: this.lead.address ? this.lead.address.replaceAll('<br />') : '',
            city: this.lead.city,
            state: this.lead.state,
            zip: this.lead.zip
          });
          this.tags = (this.lead.tags && this.lead.tags.length) ? this.lead.tags.split(',') : []
          this.formGroup.controls.contacted_today.disable();
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
    this.leadApi.get_statuses().subscribe({
      next: response => {
        this.statuses = response;
  
        if (this.lead) {
          this.formGroup.controls.status.setValue(this.lead.status);
        }
      }
    });

    this.leadApi.get_sources().subscribe({
      next: response => {
        this.sources = response;
  
        if (this.lead) {
          this.formGroup.controls.source.setValue(this.lead.source);
        }
      }
    });

    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
  
        if (this.lead) {
          this.formGroup.controls.assigned.setValue(this.lead.assigned);
        }
      }
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

    this.language$ = this.countryApi.getLanguageData().subscribe(res => {
      if (!res) {
        this.countryApi.getLanguages().subscribe({
          next: async response => {
            this.countryApi.setLanguageData(response);
  
          }
        });
      } else {
        this.languages = res;
        if (this.lead) {
          this.formGroup.controls.default_language.setValue(this.lead.default_language);
        }
      }
    })
  }

  ngOnInit() {
    this.getLead();

    this.formGroup = this.fb.group({
      status: ['', [Validators.required]],
      source: ['', [Validators.required]],
      name: ['', [Validators.required]],
      assigned: [''],
      title: [''],
      email: ['', [Validators.email]],
      website: [''],
      phonenumber: [''],
      lead_value: [''],
      company: [''],

      default_language: [''],
      description: [''],
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
  ngOnDestroy() {
    this.language$.unsubscribe();
    this.country$.unsubscribe();
  }

  get repeat_every() {
    return this.formGroup.get('repeat_every');
  }

  unlimitedCycleChange(event: any) {
    console.log(event);
    if (event.detail.checked) {
      this.formGroup.controls.cycles.setValue(0);
      this.formGroup.controls.cycles.disable();
    } else {
      this.formGroup.controls.cycles.enable();
    }
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  addTag(input: IonInput) {
    const value = input.value;
    if (value && this.tags.indexOf(value) === -1) {
      this.tags.push(value);
      input.value = '';// Clear the input after adding tag
    }
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }

  updateLead() {
    this.formGroup.value.currency = this.selectedCurrency;
    this.formGroup.value.tags = this.tags.length ? this.tags.toString() : '';

    this.submitting = true;
    this.leadApi.update(this.lead_id, this.formGroup.value).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.router.navigate(['/admin/leads/view/' + this.lead_id]);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = false;
      }, error: () => {
        this.submitting = false;
      }
    });
  }

  createLead() {
    this.formGroup.value.currency = this.selectedCurrency;
    this.formGroup.value.tags = this.tags.length ? this.tags.toString() : '';

    this.submitting = true;
    this.leadApi.store(this.formGroup.value).subscribe({
      next: (res) => {
        if (res.status) {
          this.mpcToast.show(res.message);
          this.router.navigate(['/admin/leads/view/' + res.insert_id]);
        } else {
          this.mpcToast.show(res.message, 'danger');
        }
        this.submitting = true;
      }, error: () => {
        this.submitting = true;
      }
    });
  }
  searchStaffs(event: { component: IonicSelectableComponent, text: string }) {
    const searchText = event.text ? event.text.trim() : '';
    event.component.startSearch();
    this.staffApi.get('', searchText, 0, 20).subscribe({
      next: (res: any) => {
        event.component.endSearch();
        if(res.status != false){
          event.component.items = res;
        }else{
          event.component.items = []
        }
      }, error: () => {
        event.component.endSearch();
      }
    });
  }
}
