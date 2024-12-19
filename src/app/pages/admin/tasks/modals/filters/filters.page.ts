import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TasksHelper } from 'src/app/classes/tasks-helper';
import { StaffApiService } from 'src/app/services/staff-api.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.page.html',
  styleUrls: ['./filters.page.scss'],
})
export class FiltersPage implements OnInit {
  @Input() appliedFilters: any;
  staffs: any;
  filters: UntypedFormGroup;

  constructor(
    private staffApi: StaffApiService,
    public taskHelper: TasksHelper,
    private fb: UntypedFormBuilder,
    private modalCtrl: ModalController
  ) { 
    
  }

  ngOnInit() {
    this.staffApi.get().subscribe({
      next: response => {
        this.staffs = response;
      }
    });

    console.log(this.appliedFilters);

    this.filters = this.fb.group({
      assigned: [this.appliedFilters.assigned]
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
    this.filters.value.assigned = (this.filters.value.assigned ?? []);
    this.filters.value.rel_id = this.appliedFilters ? this.appliedFilters.rel_id : null;
    this.filters.value.rel_type = this.appliedFilters ? this.appliedFilters.rel_type : null;
    this.modalCtrl.dismiss(this.filters.value);
  }
}
