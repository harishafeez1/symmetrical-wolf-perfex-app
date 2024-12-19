import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ProjectsHelper } from 'src/app/classes/projects-helper';
import { LeadApiService } from 'src/app/services/lead-api.service';
import { StaffApiService } from 'src/app/services/staff-api.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {
  @Input() appliedFilters: any;
  filters: UntypedFormGroup;

  staffs: any;
  statuses = [];
  sources = [];

  constructor(
    private leadApi: LeadApiService,
    private staffApi: StaffApiService,
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController
  ) { 
    
  }

  ngOnInit() {

    this.filters = this.fb.group({
      assigned: [this.appliedFilters.assigned]
    });

    this.leadApi.get_statuses().subscribe({
      next: response => {
        this.statuses = response;
      }
    });

    this.leadApi.get_sources().subscribe({
      next: response => {
        this.sources = response;
      }
    });

    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
        this.filters.controls.assigned.setValue(this.appliedFilters.assigned);
      }
    });

    console.log(this.appliedFilters);
  }

  isAppliedStatus(status_id: any) {
    if(this.appliedFilters?.status && this.appliedFilters.status.includes(status_id)) {
      return true;
    }
    return false;
  }

  isAppliedSource(source_id: any) {
    if(this.appliedFilters?.source && this.appliedFilters.source.includes(source_id)) {
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

  applySourceFilter(source_id) {
    if(!this.appliedFilters?.source) {
      this.appliedFilters.source = [];
    }

    if(this.appliedFilters.source.includes(source_id)) {
      console.log(this.appliedFilters.source, source_id);
      for(let i in this.appliedFilters.source) {
        if(this.appliedFilters.source[i] == source_id) {
          this.appliedFilters.source.splice(i, 1);
        }
      }
      
    } else {
      this.appliedFilters.source.push(source_id);
    }
  } 

  close() {
    this.modalCtrl.dismiss();
  }

  resetFilters() {
    this.filters.reset();
    this.appliedFilters.status = [];
    this.appliedFilters.source = [];
    this.appliedFilters.assigned = [];
  }

  applyFilters() {
    this.filters.value.status = this.appliedFilters.status;
    this.filters.value.source = this.appliedFilters.source;
    this.filters.value.assigned = (this.filters.value.assigned ?? []);
    this.modalCtrl.dismiss(this.filters.value);
  }
}
