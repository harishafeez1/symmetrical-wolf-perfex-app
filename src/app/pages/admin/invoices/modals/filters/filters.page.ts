import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { EstimatesHelper } from 'src/app/classes/estimates-helper';
import { InvoicesHelper } from 'src/app/classes/invoices-helper';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { ProposalsHelper } from 'src/app/classes/proposals-helper';
import { CustomerApiService } from 'src/app/services/customer-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {
  @Input() appliedFilters: any;
  staffs: any = [];
  filters: UntypedFormGroup;

  constructor(
    private staffApi: StaffApiService,
    private proposalsHelper: ProposalsHelper,
    public invoicesHelper: InvoicesHelper,
    private estimatesHelper: EstimatesHelper,
    private projectsHelper: ProjectsHelper,
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController
  ) { 
    
  }

  ngOnInit() {
    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
        this.filters.controls.sale_agent.setValue(this.appliedFilters.sale_agent);
      }
    });

    console.log(this.appliedFilters);

    this.filters = this.fb.group({
      sale_agent: [this.appliedFilters.sale_agent]
    });
  }

  isAppliedStatus(status_id) {
    if(this.appliedFilters?.status && this.appliedFilters.status.includes(status_id)) {
      return true;
    }
    return false;
  }

  applyStatusFilter(status_id) {
    if(!this.appliedFilters?.status) {
      this.appliedFilters.status = [];
    }

    if(this.appliedFilters.status.includes(status_id)) {
      console.log(this.appliedFilters.status, status_id);
      for(let i in this.appliedFilters.status) {
        if(this.appliedFilters.status[i] == status_id) {
          this.appliedFilters.status.splice(i, 1);
        }
      }
      
    } else {
      this.appliedFilters.status.push(status_id);
    }
  } 

  close() {
    this.modalCtrl.dismiss();
  }

  resetFilters() {
    this.filters.reset();
    this.appliedFilters.status = [];
  }

  applyFilters() {
    this.filters.value.status = this.appliedFilters.status;
    this.modalCtrl.dismiss(this.filters.value);
  }
}
